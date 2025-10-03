import { gql } from 'graphql-request';
import { graphQLClient, getGreenshiftScripts } from './api';

export async function getNewsActivityContent(page = 1, perPage = 9, language = 'en') {
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
            excerpt
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
            }
          }
        }
      }
    `;
  
    // Category IDs for news and activity - different IDs for English and Thai
    const categoryIds =
      language === "th"
        ? ["29", "30"] // Thai
        : ["27", "28", "51", "53", "54"]; // English
  
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

export async function getPostBySlug(slug, language = 'en') {
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
                }
                greenshiftInlineCss
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

        // Handle translations based on language
        if (language === 'th' && post.translations && post.translations.length > 0) {
            const thaiTranslation = post.translations[0];
            return {
                ...post,
                title: thaiTranslation.title || post.title,
                excerpt: thaiTranslation.excerpt || post.excerpt,
                content: thaiTranslation.content || post.content,
                slug: thaiTranslation.slug || post.slug,
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
        query GetNewsActivityContent($first: Int!, $after: String, $categoryIds: [ID]) {
            posts(
                first: $first
                after: $after
                where: { 
                    categoryIn: $categoryIds
                    orderby: { field: DATE, order: DESC }
                }
            ) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                nodes {
                    id
                    slug
                    title
                    date
                    excerpt
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
                    }
                }
            }
        }
    `;
    // Category IDs for news and activity - different IDs for English and Thai
    const categoryIds = language === 'th' 
        ? ['47'] // Thai category IDs (you'll need to verify these)
        : ['33']; // English category IDs

    // Pagination: calculate the cursor for the requested page
    let after = null;
    let lastEndCursor = null;
    let hasNextPage = true;
    let allNodes = [];

    // If page 1, just fetch the first page
    if (page === 1) {
        const variables = { first: perPage, after, categoryIds };
        const data = await graphQLClient.request(query, variables);
        return {
            content: data.posts.nodes,
            pageInfo: data.posts.pageInfo
        };
    }

    // For page > 1, iterate to get the correct cursor
    for (let i = 1; i < page; i++) {
        const variables = { first: perPage, after, categoryIds };
        const data = await graphQLClient.request(query, variables);
        hasNextPage = data.posts.pageInfo.hasNextPage;
        lastEndCursor = data.posts.pageInfo.endCursor;
        if (!hasNextPage) {
            // No more pages, return empty
            return {
                content: [],
                pageInfo: data.posts.pageInfo
            };
        }
        after = lastEndCursor;
    }

    // Now fetch the requested page
    const variables = { first: perPage, after, categoryIds };
    const data = await graphQLClient.request(query, variables);

    return {
        content: data.posts.nodes,
        pageInfo: data.posts.pageInfo
    };
}
