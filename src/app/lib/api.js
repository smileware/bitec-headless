import crypto from 'crypto';
import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
export const GRAPHQL_CACHE_TAG = 'wordpress-content';
const GRAPHQL_CACHE_TTL = parseInt(process.env.GRAPHQL_CACHE_TTL || '120', 10);

export const graphQLClient = new GraphQLClient(endpoint);

const rawGraphQLRequest = graphQLClient.request.bind(graphQLClient);
const supportsCache = typeof unstable_cache === 'function';

function createCacheKey(query, variables) {
  try {
    const hash = crypto.createHash('sha1');
    hash.update(typeof query === 'string' ? query : JSON.stringify(query));
    hash.update(JSON.stringify(variables || {}));
    return hash.digest('hex');
  } catch {
    return `${query}:${JSON.stringify(variables)}`;
  }
}

// Check if we're running on the client side
function isClientSide() {
  return typeof window !== 'undefined';
}

async function cachedGraphQLRequest(query, variables = {}, requestHeaders) {
  const execute = () => rawGraphQLRequest(query, variables, requestHeaders);
  
  // Skip caching on client side - unstable_cache only works on server
  if (isClientSide()) {
    return execute();
  }
  
  if (process.env.SKIP_GRAPHQL_CACHE === 'true' || !supportsCache) {
    return execute();
  }
  
  const cacheKey = createCacheKey(query, variables);
  
  try {
    const cachedFn = unstable_cache(
      execute,
      ['graphql-request', cacheKey],
      {
        revalidate: GRAPHQL_CACHE_TTL,
        tags: [GRAPHQL_CACHE_TAG],
      }
    );
    return await cachedFn();
  } catch (error) {
    // Silently fall back to direct request if cache fails
    // This can happen in edge cases or during development
    return execute();
  }
}

graphQLClient.request = cachedGraphQLRequest;

export async function requestGraphQL(query, variables = {}, { cache = true } = {}) {
  if (cache === false) {
    return rawGraphQLRequest(query, variables);
  }
  return cachedGraphQLRequest(query, variables);
}

export async function getSiteInfo() {
  const query = gql`
    query SiteInfo {
      generalSettings {
        title
        description
      }
    }
  `;
  const data = await graphQLClient.request(query);
  return data.generalSettings;
}

export async function getGlobalStyle() {
  const query = gql`
    query GlobalCss {
      sMobileCssUrl
      sDesktopCssUrl
      globalInlineCss
    }
  `;
  const data = await graphQLClient.request(query);
  return data;
}


export async function getPageBySlug(slug, language = null) {
  const query = gql`
    query($uri: String!) {
      pageBy(uri: $uri) {
        id
        slug
        title
        content
        blocks(
          attributes: false
          dynamicContent: false
          htmlContent: false
          originalContent: true
          postTemplate: false
        )
        greenshiftInlineCss
        enqueuedStylesheets(first: 50) {
          edges { node { handle, after } }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails { width height }
          }
        }
        enqueuedScripts(first: 100) {
          edges {
            node {
              src
              after
            }
          }
        }
        translations {
          id
          slug
          title
          content
          greenshiftInlineCss
          enqueuedStylesheets(first: 50) {
            edges { node { handle, after } }
          }
          blocks(
            attributes: false
            dynamicContent: false
            htmlContent: false
            originalContent: true
            postTemplate: false
          )
        }
      }
    }
  `;
  
  const variables = { uri: slug };
  const data = await graphQLClient.request(query, variables);
  const page = data?.pageBy;

  if (!page) return null;
  
  const greenshiftScripts = getGreenshiftScripts(page.enqueuedScripts?.edges || []);
  
  // Resolve CSS: prefer greenshiftInlineCss, fall back to enqueued greenshift-post-css
  page.greenshiftInlineCss = extractGreenshiftCss(page);
  if (page.translations) {
    page.translations = page.translations.map(t => ({
      ...t,
      greenshiftInlineCss: extractGreenshiftCss(t),
    }));
  }
  
  return {
    ...page,
    greenshiftScripts
  };
}

// Get only greenshift plugin scripts
export function getGreenshiftScripts(edges) {
  const scripts = [];
  
  edges.forEach(({ node }) => {
    const { src } = node;
    
    if (src && src.includes('greenshift-animation-and-page-builder-blocks')) {
      scripts.push(src);
    }
  });
  
  return scripts;
}

// GreenShift v12.9+ moved page CSS from greenshiftInlineCss to enqueuedStylesheets.
// This extracts it from the 'greenshift-post-css' handle.
export function extractGreenshiftCss(item) {
  if (item?.greenshiftInlineCss) return item.greenshiftInlineCss;
  
  const edges = item?.enqueuedStylesheets?.edges;
  if (!edges) return '';
  
  const gsNode = edges.find(e => e.node?.handle === 'greenshift-post-css');
  if (!gsNode?.node?.after) return '';
  
  const after = gsNode.node.after;
  return Array.isArray(after) ? after.join('') : after;
}

// GraphQL fragment for enqueued stylesheets
export const ENQUEUED_STYLESHEETS_FRAGMENT = `
  enqueuedStylesheets(first: 50) {
    edges {
      node {
        handle
        after
      }
    }
  }
`;


// DEPRECATED** NO LONGER USED. Use 100% GraphQL instead.
// Simple function to get Thai content from REST API
async function getThaiContent(slug) {
  try {
    const restEndpoint = (process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql').replace('/graphql', '');
    
    // For homepage, use 'home' instead of '/'
    const pageSlug = slug === '/' ? 'home' : slug;
    const restUrl = `${restEndpoint}/wp-json/wp/v2/pages?slug=${pageSlug}&lang=th`;
    const response = await fetch(restUrl);
    if (response.ok) {
      const pages = await response.json();
      if (pages && pages.length > 0) {
        return pages[0].content.rendered;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching Thai content:', error);
    return null;
  }
}
