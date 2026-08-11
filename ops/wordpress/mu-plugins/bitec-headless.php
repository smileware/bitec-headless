<?php
/**
 * Plugin Name: BITEC Headless Origin Controls
 * Description: Lean event REST API, targeted Next.js revalidation, and an optional GraphQL origin gate.
 * Version: 1.1.0
 */

defined('ABSPATH') || exit;

/**
 * Required wp-config.php constants (values must never be committed):
 * BITEC_REVALIDATE_URL
 * BITEC_REVALIDATE_SECRET
 * BITEC_GRAPHQL_ORIGIN_SECRET
 * BITEC_GRAPHQL_GATE_ENABLED (keep false until the frontend rollout is verified)
 */

function bitec_headless_graphql_gate() {
    if (!defined('BITEC_GRAPHQL_GATE_ENABLED') || !BITEC_GRAPHQL_GATE_ENABLED) {
        return;
    }

    $path = wp_parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH);
    if (rtrim((string) $path, '/') !== '/graphql') {
        return;
    }

    if (is_user_logged_in() && current_user_can('manage_options')) {
        return;
    }

    $expected = defined('BITEC_GRAPHQL_ORIGIN_SECRET') ? (string) BITEC_GRAPHQL_ORIGIN_SECRET : '';
    $provided = isset($_SERVER['HTTP_X_BITEC_ORIGIN_KEY'])
        ? (string) $_SERVER['HTTP_X_BITEC_ORIGIN_KEY']
        : '';

    if ($expected !== '' && $provided !== '' && hash_equals($expected, $provided)) {
        return;
    }

    status_header(403);
    nocache_headers();
    wp_send_json_error(array('message' => 'GraphQL origin access denied'), 403);
}
add_action('init', 'bitec_headless_graphql_gate', 0);

function bitec_headless_event_timestamp($value) {
    if (!$value) {
        return null;
    }
    $timestamp = strtotime((string) $value);
    return $timestamp === false ? null : $timestamp;
}

function bitec_headless_event_overlaps_period($start, $end, $month, $year) {
    if (!$month && !$year) {
        return true;
    }

    $start_year = (int) gmdate('Y', $start);
    $end_year = (int) gmdate('Y', $end);
    $first_year = $year ? (int) $year : $start_year;
    $last_year = $year ? (int) $year : $end_year;

    for ($candidate_year = $first_year; $candidate_year <= $last_year; $candidate_year++) {
        $candidate_month = $month ? (int) $month : 1;
        $period_start = gmmktime(0, 0, 0, $candidate_month, 1, $candidate_year);
        $period_end = $month
            ? gmmktime(23, 59, 59, $candidate_month + 1, 0, $candidate_year)
            : gmmktime(23, 59, 59, 12, 31, $candidate_year);
        if ($start <= $period_end && $end >= $period_start) {
            return true;
        }
    }
    return false;
}

function bitec_headless_event_term_nodes($post_id, $taxonomy) {
    $terms = wp_get_post_terms($post_id, $taxonomy);
    if (is_wp_error($terms)) {
        return array();
    }

    return array_map(function ($term) use ($taxonomy) {
        $node = array(
            'id' => (string) $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
        );
        if ($taxonomy === 'event-location') {
            $color = function_exists('get_field')
                ? get_field('event_location_color', $taxonomy . '_' . $term->term_id)
                : null;
            $node['taxonomyEventLocation'] = array('eventLocationColor' => $color ?: '');
        }
        return $node;
    }, $terms);
}

function bitec_headless_event_node($post_id) {
    $image_id = get_post_thumbnail_id($post_id);
    $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'full') : '';
    $image_alt = $image_id ? get_post_meta($image_id, '_wp_attachment_image_alt', true) : '';

    return array(
        'id' => (string) $post_id,
        'slug' => get_post_field('post_name', $post_id),
        'title' => html_entity_decode(get_the_title($post_id), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'translations' => array(),
        'featuredImage' => $image_url ? array(
            'node' => array(
                'sourceUrl' => $image_url,
                'altText' => $image_alt ?: get_the_title($post_id),
            ),
        ) : null,
        'eventFieldGroup' => array(
            'eventStartdate' => get_post_meta($post_id, 'event_startdate', true),
            'eventEnddate' => get_post_meta($post_id, 'event_enddate', true),
            'eventHall' => get_post_meta($post_id, 'event_hall', true),
            'fieldGroupName' => 'eventFieldGroup',
        ),
        'eventCategories' => array(
            'nodes' => bitec_headless_event_term_nodes($post_id, 'event-category'),
        ),
        'eventLocation' => array(
            'nodes' => bitec_headless_event_term_nodes($post_id, 'event-location'),
        ),
    );
}

function bitec_headless_event_ids($language) {
    $query = new WP_Query(array(
        'post_type' => 'event',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
        'orderby' => 'none',
        'lang' => $language,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ));
    return $query->posts;
}

function bitec_headless_event_matches_bitec_live($post_id) {
    foreach (array('event-category', 'event-location') as $taxonomy) {
        $terms = wp_get_post_terms($post_id, $taxonomy);
        if (is_wp_error($terms)) {
            continue;
        }
        foreach ($terms as $term) {
            if (strpos(strtolower($term->name), 'bitec live') !== false || $term->slug === 'bitec-live') {
                return true;
            }
        }
    }
    return false;
}

function bitec_headless_events_rest(WP_REST_Request $request) {
    $mode = sanitize_key($request->get_param('mode') ?: 'filtered');
    $allowed_modes = array('filtered', 'recent', 'bitec-live', 'categories', 'years');
    if (!in_array($mode, $allowed_modes, true)) {
        return new WP_Error('invalid_mode', 'Invalid event mode', array('status' => 400));
    }

    $language = $request->get_param('language') === 'th' ? 'th' : 'en';
    $previous_language = apply_filters('wpml_current_language', null);
    do_action('wpml_switch_language', $language);

    try {
        $ids = bitec_headless_event_ids($language);

        if ($mode === 'categories') {
            $terms = get_terms(array(
                'taxonomy' => 'event-category',
                'hide_empty' => true,
                'lang' => $language,
            ));
            if (is_wp_error($terms)) {
                return $terms;
            }
            return array_values(array_map(function ($term) {
                return array(
                    'id' => (string) $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'count' => (int) $term->count,
                );
            }, $terms));
        }

    if ($mode === 'years') {
        $years = array();
        foreach ($ids as $post_id) {
            foreach (array('event_startdate', 'event_enddate') as $meta_key) {
                $timestamp = bitec_headless_event_timestamp(get_post_meta($post_id, $meta_key, true));
                if ($timestamp) {
                    $years[(int) gmdate('Y', $timestamp)] = true;
                }
            }
        }
        $result = array_keys($years);
        rsort($result, SORT_NUMERIC);
        return $result;
    }

    $event_type = $request->get_param('eventType') === 'past' ? 'past' : 'upcoming';
    $month = absint($request->get_param('month'));
    $year = absint($request->get_param('year'));
    $category_id = absint($request->get_param('categoryId'));
    $today = strtotime(gmdate('Y-m-d 00:00:00'));
    $matches = array();

    foreach ($ids as $post_id) {
        $start = bitec_headless_event_timestamp(get_post_meta($post_id, 'event_startdate', true));
        if (!$start) {
            continue;
        }
        $end = bitec_headless_event_timestamp(get_post_meta($post_id, 'event_enddate', true)) ?: $start;
        $is_upcoming = $end >= $today;
        if (($event_type === 'upcoming' && !$is_upcoming) || ($event_type === 'past' && $is_upcoming)) {
            continue;
        }
        if ($category_id && !has_term($category_id, 'event-category', $post_id)) {
            continue;
        }
        if (!bitec_headless_event_overlaps_period($start, $end, $month, $year)) {
            continue;
        }
        if ($mode === 'bitec-live' && !bitec_headless_event_matches_bitec_live($post_id)) {
            continue;
        }
        $matches[] = array('id' => $post_id, 'start' => $start);
    }

    usort($matches, function ($left, $right) use ($event_type) {
        return $event_type === 'past'
            ? $right['start'] <=> $left['start']
            : $left['start'] <=> $right['start'];
    });

    $limit = min(24, max(1, absint($request->get_param('limit') ?: 9)));
    $per_page = min(24, max(1, absint($request->get_param('perPage') ?: 12)));
    $page = max(1, absint($request->get_param('page') ?: 1));
    $page_size = in_array($mode, array('recent', 'bitec-live'), true) ? $limit : $per_page;
    $offset = in_array($mode, array('recent', 'bitec-live'), true) ? 0 : ($page - 1) * $page_size;
    $selected = array_slice($matches, $offset, $page_size);
    $nodes = array_map(function ($item) {
        return bitec_headless_event_node($item['id']);
    }, $selected);

    if (in_array($mode, array('recent', 'bitec-live'), true)) {
        return $nodes;
    }

        return array(
            'events' => $nodes,
            'hasMore' => $offset + count($nodes) < count($matches),
            'total' => count($matches),
        );
    } finally {
        if ($previous_language) {
            do_action('wpml_switch_language', $previous_language);
        }
    }
}

function bitec_headless_register_rest_routes() {
    register_rest_route('bitec/v1', '/events', array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bitec_headless_events_rest',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'bitec_headless_register_rest_routes');

function bitec_headless_public_paths($post_id, $post_type) {
    $paths = array();
    $languages = apply_filters('wpml_active_languages', null, array('skip_missing' => 0));
    if (!is_array($languages) || !$languages) {
        $languages = array('en' => array('language_code' => 'en'));
    }

    $prefixes = array(
        'post' => 'news',
        'event' => 'event',
        'gallery' => 'gallery',
        'hotel' => 'hotel',
    );

    foreach ($languages as $language) {
        $code = isset($language['language_code']) ? $language['language_code'] : 'en';
        $translated_id = apply_filters('wpml_object_id', $post_id, $post_type, false, $code);
        if (!$translated_id) {
            continue;
        }
        $language_prefix = $code === 'th' ? '/th' : '';
        if ($post_type === 'page') {
            $uri = trim((string) get_page_uri($translated_id), '/');
            $paths[] = $language_prefix . ($uri ? '/' . $uri : '/');
        } elseif (isset($prefixes[$post_type])) {
            $slug = get_post_field('post_name', $translated_id);
            if ($slug) {
                $paths[] = $language_prefix . '/' . $prefixes[$post_type] . '/' . $slug;
            }
        }
    }
    $archive_paths = array(
        'post' => array('/news-and-activity', '/th/news-and-activity'),
        'event' => array('/whats-on', '/th/whats-on'),
        'gallery' => array('/gallery', '/th/gallery'),
        'hotel' => array('/visitor-guide', '/th/visitor-guide'),
    );
    $related = isset($archive_paths[$post_type]) ? $archive_paths[$post_type] : array();
    $related = apply_filters('bitec_headless_archive_paths', $related, $post_type);
    return array_values(array_unique(array_merge($paths, $related)));
}

function bitec_headless_queue_content_type($post_type) {
    $paths = bitec_headless_public_paths(0, $post_type);
    $GLOBALS['bitec_headless_revalidation'][$post_type] = array(
        'contentType' => $post_type,
        'paths' => $paths,
    );
}

function bitec_headless_queue_revalidation($post_id) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    $post_type = get_post_type($post_id);
    $post_slug = (string) get_post_field('post_name', $post_id);
    if (in_array($post_type, array('wp_block', 'reusable_block'), true) && $post_slug === 'theme-footer') {
        $GLOBALS['bitec_headless_revalidation']['footer'] = array(
            'contentType' => 'footer',
            'slug' => 'theme-footer',
            'paths' => array(),
        );
        return;
    }
    if (!in_array($post_type, array('page', 'post', 'event', 'gallery', 'hotel'), true)) {
        return;
    }

    if (!isset($GLOBALS['bitec_headless_revalidation'])) {
        $GLOBALS['bitec_headless_revalidation'] = array();
    }
    $GLOBALS['bitec_headless_revalidation'][$post_type] = array(
        'contentType' => $post_type,
        'slug' => $post_slug,
        'paths' => bitec_headless_public_paths($post_id, $post_type),
    );
}
add_action('save_post', 'bitec_headless_queue_revalidation', 20);
add_action('trashed_post', 'bitec_headless_queue_revalidation', 20);
add_action('before_delete_post', 'bitec_headless_queue_revalidation', 20);
add_action('set_object_terms', function ($object_id) {
    bitec_headless_queue_revalidation($object_id);
}, 20);
add_action('edited_term', function ($term_id, $term_taxonomy_id, $taxonomy) {
    $taxonomy_types = array(
        'category' => 'post',
        'event-category' => 'event',
        'event-location' => 'event',
        'gallery-type' => 'gallery',
        'hotel-category' => 'hotel',
    );
    if (isset($taxonomy_types[$taxonomy])) {
        bitec_headless_queue_content_type($taxonomy_types[$taxonomy]);
    }
}, 20, 3);
add_action('delete_term', function ($term_id, $term_taxonomy_id, $taxonomy) {
    $taxonomy_types = array(
        'category' => 'post',
        'event-category' => 'event',
        'event-location' => 'event',
        'gallery-type' => 'gallery',
        'hotel-category' => 'hotel',
    );
    if (isset($taxonomy_types[$taxonomy])) {
        bitec_headless_queue_content_type($taxonomy_types[$taxonomy]);
    }
}, 20, 3);
add_action('wp_update_nav_menu', function () {
    $GLOBALS['bitec_headless_revalidation']['navigation'] = array(
        'contentType' => 'navigation',
        'paths' => array(),
    );
}, 20);

function bitec_headless_send_revalidation() {
    $queue = isset($GLOBALS['bitec_headless_revalidation'])
        ? $GLOBALS['bitec_headless_revalidation']
        : array();
    if (!$queue || !defined('BITEC_REVALIDATE_URL') || !defined('BITEC_REVALIDATE_SECRET')) {
        return;
    }

    foreach ($queue as $payload) {
        wp_remote_post(BITEC_REVALIDATE_URL, array(
            'timeout' => 1,
            'blocking' => false,
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-revalidate-secret' => BITEC_REVALIDATE_SECRET,
            ),
            'body' => wp_json_encode($payload),
        ));
    }
}
add_action('shutdown', 'bitec_headless_send_revalidation', 20);
