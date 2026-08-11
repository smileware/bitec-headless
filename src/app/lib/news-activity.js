import { cache } from 'react';
import { gql } from 'graphql-request';
import { graphQLClient, getGreenshiftScripts, extractGreenshiftCss } from './api';

const NEWS_ACTIVITY_CATEGORY_IDS = {
    news: ['27', '28', '51', '53'],
    blog: ['54'],
};

export async function getNewsActivityContent(page = 1, perPage = 9, language = 'en', filter = 'news') {
    const query = gql`
      query GetNewsActivityContent($size: Int!, $offset: Int!, $categoryIds: [ID]) {
        posts(
          where: { 
            categoryIn: $categoryIds
            orderby: { field: DATE, order: DESC }
            offsetPagination: { size: $size, offset: $offset }
          }
        ) {
          pageInfo {
            offsetPagination {
              total
            }
          }
          nodes {
            id
            slug
            title
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            translations {
              slug
              title
            }
          }
        }
      }
    `;
  
    const categoryIds = NEWS_ACTIVITY_CATEGORY_IDS[filter] || NEWS_ACTIVITY_CATEGORY_IDS.news;
  
    const offset = (page - 1) * perPage;
  
    const data = await graphQLClient.request(query, {
      size: perPage,
      offset,
      categoryIds,
    });
  
    return {
      content: data.posts.nodes,
      pageInfo: data.posts.pageInfo, // ✅ same structure as before
    };
}

// Wrapped in React cache() so metadata + page body (and both language variants
// that resolve the same base post) share ONE GraphQL request per render instead
// of hitting the Cloudways endpoint 2x per page load. Combined with the page-level
// ISR (revalidate) below, Cloudways is hit at most once per post per 5 min.
export const getPostBySlug = cache(getPostBySlugRaw);

async function getPostBySlugRaw(slug, language = 'en') {
    const query = gql`
        query GetPostBySlug($slug: ID!) {
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

    try {
        const variables = { slug };
        const data = await graphQLClient.request(query, variables);
        const post = data.post;

        if (!post) return null;

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
    } catch (error) {
        console.error('Error fetching post by slug:', error);
        return null;
    }
}



export async function getNewsActivitySustainability(page = 1, perPage = 6, language = 'en') {
    const query = gql`
        query GetNewsActivitySustainability($size: Int!, $offset: Int!, $categoryIds: [ID]) {
            posts(
                where: { 
                    categoryIn: $categoryIds
                    orderby: { field: DATE, order: DESC }
                    offsetPagination: { size: $size, offset: $offset }
                }
            ) {
                pageInfo {
                    offsetPagination {
                        total
                    }
                }
                nodes {
                    id
                    slug
                    title
                    date
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                    translations {
                        slug
                        title
                    }
                }
            }
        }
    `;
    // Category IDs for news and activity - different IDs for English and Thai
    const categoryIds = language === 'th' 
        ? ['47'] // Thai category IDs (you'll need to verify these)
        : ['33']; // English category IDs

    const offset = (page - 1) * perPage;
    const data = await graphQLClient.request(query, {
        size: perPage,
        offset,
        categoryIds,
    });

    return {
        content: data.posts.nodes,
        pageInfo: data.posts.pageInfo
    };
}
