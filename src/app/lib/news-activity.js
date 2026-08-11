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

export async function getNewsActivityContent(page = 1, perPage = 9, language = 'en', filter = 'news') {
    const categoryIds = NEWS_ACTIVITY_CATEGORY_IDS[filter] || NEWS_ACTIVITY_CATEGORY_IDS.news;
    return getPostsFromRest({ page, perPage, language, categoryIds });
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

async function getPostsFromRest({ page, perPage, language, categoryIds }) {
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
        headers: { Accept: 'application/json' },
        next: {
            revalidate: 1800,
            tags: [GRAPHQL_CACHE_TAG],
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

// Wrapped in React cache() so metadata + page body (and both language variants
// that resolve the same base post) share ONE GraphQL request per render instead
// of hitting the Cloudways endpoint 2x per page load. Combined with the page-level
// ISR (revalidate) below, Cloudways is hit at most once per post per 30 min.
export const getPostBySlug = cache(getPostBySlugRaw);

async function getPostBySlugRaw(slug, language = 'en') {
    const query = gql`
        query GetPublishedPostBySlugV2($slug: ID!) {
            post(id: $slug, idType: SLUG) {
                id
                slug
                title
                date
                excerpt
                content
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

    const variables = { slug };
    // Detail pages already have route-level ISR. Bypass the generic data cache
    // here so a transient successful `{ post: null }` response cannot poison a
    // published article for the whole cache TTL.
    const data = await requestGraphQL(query, variables, { cache: false });
    const post = data.post;

    if (!post) {
        if (await postExistsInRest(slug, language)) {
            throw new Error(`GraphQL returned null for published post: ${slug}`);
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

    if (language === 'th' && post.translations && post.translations.length > 0) {
        const thaiTranslation = post.translations[0];
        return {
            ...post,
            title: thaiTranslation.title || post.title,
            excerpt: thaiTranslation.excerpt || post.excerpt,
            content: thaiTranslation.content || post.content,
            slug: thaiTranslation.slug || post.slug,
            greenshiftInlineCss: thaiTranslation.greenshiftInlineCss || post.greenshiftInlineCss,
            greenshiftScripts: getGreenshiftScripts(post.enqueuedScripts?.edges || [])
        };
    }

    return {
        ...post,
        greenshiftScripts: getGreenshiftScripts(post.enqueuedScripts?.edges || [])
    };
}



export async function getNewsActivitySustainability(page = 1, perPage = 6, language = 'en') {
    // Category IDs for news and activity - different IDs for English and Thai
    const categoryIds = language === 'th' 
        ? ['47']
        : ['33'];

    return getPostsFromRest({ page, perPage, language, categoryIds });
}
