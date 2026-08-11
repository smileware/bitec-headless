import { cache } from 'react';
import { gql } from 'graphql-request';
import {
    GRAPHQL_CACHE_TAG,
    requestGraphQL,
    getGreenshiftScripts,
    extractGreenshiftCss,
} from './api';

const NEWS_ACTIVITY_CATEGORY_IDS = {
    news: ['27', '28', '51', '53'],
    blog: ['54'],
};

export async function getNewsActivityContent(
    page = 1,
    perPage = 9,
    language = 'en',
    filter = 'news',
    options = {}
) {
    const categoryIds = NEWS_ACTIVITY_CATEGORY_IDS[filter] || NEWS_ACTIVITY_CATEGORY_IDS.news;
    return getPostsFromRest({ page, perPage, language, categoryIds }, options);
}

const wordpressOrigin = (
    process.env.API_DOMAIN
    || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql'
).replace(/\/graphql\/?$/, '');

function decodeTitle(value = '') {
    return value
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function cacheTtlFor(value) {
    const source = String(value);
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    }
    return 3600 + (Math.abs(hash) % 3601);
}

function normalizeRestPost(post, language) {
    const title = decodeTitle(post?.title?.rendered || '');
    const media = post?._embedded?.['wp:featuredmedia']?.[0];

    return {
        id: String(post.id),
        slug: post.slug,
        title,
        date: post.date,
        featuredImage: media
            ? {
                node: {
                    sourceUrl: media.source_url,
                    altText: media.alt_text || title,
                },
            }
            : null,
        // NewsCard reads translations[0] on Thai routes. The REST request is
        // already language-filtered, so expose that record in the same shape.
        translations: language === 'th' ? [{ slug: post.slug, title }] : [],
    };
}

async function getPostsFromRest({ page, perPage, language, categoryIds }, { signal } = {}) {
    const size = Math.min(Math.max(perPage, 1), 24);
    const offset = (Math.max(page, 1) - 1) * size;
    const url = new URL('/wp-json/wp/v2/posts', wordpressOrigin);

    url.searchParams.set('categories', categoryIds.join(','));
    url.searchParams.set('per_page', String(size));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('orderby', 'date');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('lang', language === 'th' ? 'th' : 'en');
    url.searchParams.set('_embed', 'wp:featuredmedia');
    url.searchParams.set('_fields', 'id,slug,title,date,_links,_embedded');

    const response = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
        next: {
            revalidate: cacheTtlFor(url),
            tags: [GRAPHQL_CACHE_TAG, 'wp:post'],
        },
    });

    if (!response.ok) {
        throw new Error(`WordPress REST posts request failed with ${response.status}`);
    }

    const posts = await response.json();
    const total = Number.parseInt(response.headers.get('x-wp-total') || '0', 10);

    return {
        content: posts.map((post) => normalizeRestPost(post, language)),
        pageInfo: {
            offsetPagination: {
                total: Number.isFinite(total) ? total : 0,
            },
        },
    };
}

async function postExistsInRest(slug, language) {
    const url = new URL('/wp-json/wp/v2/posts', wordpressOrigin);
    url.searchParams.set('slug', slug);
    url.searchParams.set('lang', language === 'th' ? 'th' : 'en');
    url.searchParams.set('per_page', '1');
    url.searchParams.set('_fields', 'id');

    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`WordPress REST post lookup failed with ${response.status}`);
    }

    const posts = await response.json();
    return posts.length > 0;
}

function normalizeWordPressSlug(slug) {
    // WordPress stores non-ASCII post_name values with lowercase percent
    // escapes. Next route params can preserve uppercase escapes, which REST
    // accepts but WPGraphQL's SLUG lookup compares case-sensitively.
    return String(slug || '').replace(/%[0-9A-F]{2}/g, (escape) => escape.toLowerCase());
}

// Wrapped in React cache() so metadata + page body share one lookup per render
// instead of hitting Cloudways twice. Route-level ISR provides the two-hour
// fallback; the webhook normally revalidates an edited detail path earlier.
export const getPostBySlug = cache(getPostBySlugRaw);

async function getPostBySlugRaw(slug, language = 'en') {
    const normalizedSlug = normalizeWordPressSlug(slug);
    const query = gql`
        query GetPublishedPostBySlugV3($slug: ID!) {
            post(id: $slug, idType: SLUG) {
                id
                slug
                title
                date
                excerpt
                content
                language {
                    code
                }
                featuredImage {
                    node {
                        sourceUrl
                        altText
                    }
                }
                categories {
                    nodes {
                        id
                        name
                        slug
                    }
                }
                translations {
                    slug
                    title
                    excerpt
                    content
                    language {
                        code
                    }
                    greenshiftInlineCss
                    enqueuedStylesheets(first: 50) {
                        edges { node { handle, after } }
                    }
                }
                greenshiftInlineCss
                enqueuedStylesheets(first: 50) {
                    edges { node { handle, after } }
                }
                enqueuedScripts(first: 100) {
                    edges {
                        node {
                            src
                            after
                        }
                    }
                }
            }
        }
    `;

    const variables = { slug: normalizedSlug };
    // Detail pages already have route-level ISR. Bypass the generic data cache
    // here so a transient successful `{ post: null }` response cannot poison a
    // published article for the whole cache TTL.
    const data = await requestGraphQL(query, variables, { cache: false });
    const post = data.post;

    if (!post) {
        if (await postExistsInRest(normalizedSlug, language)) {
            throw new Error('GraphQL returned null for a published post');
        }
        return null;
    }

    // Resolve CSS from enqueued stylesheets (GreenShift v12.9+)
    post.greenshiftInlineCss = extractGreenshiftCss(post);
    if (post.translations) {
        post.translations = post.translations.map(t => ({
            ...t,
            greenshiftInlineCss: extractGreenshiftCss(t),
        }));
    }

    const requestedLanguage = language === 'th' ? 'th' : 'en';
    const postLanguage = post.language?.code?.toLowerCase();
    const requestedTranslation = post.translations?.find(
        (translation) => translation?.language?.code?.toLowerCase() === requestedLanguage
    );

    if (postLanguage && postLanguage !== requestedLanguage && requestedTranslation) {
        return {
            ...post,
            title: requestedTranslation.title || post.title,
            excerpt: requestedTranslation.excerpt || post.excerpt,
            content: requestedTranslation.content || post.content,
            slug: requestedTranslation.slug || post.slug,
            greenshiftInlineCss: requestedTranslation.greenshiftInlineCss || post.greenshiftInlineCss,
            greenshiftScripts: getGreenshiftScripts(post.enqueuedScripts?.edges || [])
        };
    }

    return {
        ...post,
        greenshiftScripts: getGreenshiftScripts(post.enqueuedScripts?.edges || [])
    };
}



export async function getNewsActivitySustainability(
    page = 1,
    perPage = 6,
    language = 'en',
    options = {}
) {
    // Category IDs for news and activity - different IDs for English and Thai
    const categoryIds = language === 'th' 
        ? ['47']
        : ['33'];

    return getPostsFromRest({ page, perPage, language, categoryIds }, options);
}
