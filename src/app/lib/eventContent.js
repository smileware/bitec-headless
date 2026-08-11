const WORDPRESS_ORIGIN = (
    process.env.API_DOMAIN
    || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql'
).replace(/\/graphql\/?$/, '');

function cacheTtlFor(value) {
    const source = String(value);
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    }
    return 3600 + (Math.abs(hash) % 3601);
}

async function fetchEventContent(mode, params = {}, { signal } = {}) {
    const searchParams = new URLSearchParams({ mode });
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const url = `${WORDPRESS_ORIGIN}/wp-json/bitec/v1/events?${searchParams.toString()}`;
    const response = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
        next: {
            revalidate: cacheTtlFor(url),
            tags: ['wp:event'],
        },
    });

    if (!response.ok) {
        throw new Error(`WordPress event API returned ${response.status}`);
    }
    const data = await response.json();

    // During the staged MU-plugin rollout, WordPress briefly encoded sparse
    // term keys as an object. Normalize both the legacy cached shape and the
    // corrected response so category filters never disappear until TTL expiry.
    if (mode === 'categories' && data && !Array.isArray(data)) {
        return Object.values(data);
    }
    return data;
}

export function getRecentEvents(limit = 9, options = {}) {
    return fetchEventContent('recent', {
        limit,
        language: options.language || 'en',
    }, options);
}

export function getRecentBitecLiveEvents(locationId = 'Bitec Live', limit = 9, options = {}) {
    return fetchEventContent('bitec-live', {
        locationId,
        limit,
        language: options.language || 'en',
    }, options);
}

export function getAllEventCategories(options = {}) {
    return fetchEventContent('categories', {
        language: options.language || 'en',
    }, options);
}

export function getFilteredEvents(filters = {}, options = {}) {
    return fetchEventContent('filtered', {
        ...filters,
        language: options.language || filters.language || 'en',
    }, options);
}

export function getAllEventYears(options = {}) {
    return fetchEventContent('years', {
        language: options.language || 'en',
    }, options);
}
