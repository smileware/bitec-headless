import crypto from 'crypto';
import { cache } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
export const GRAPHQL_CACHE_TAG = 'wordpress-content';
// WordPress is the origin, not a low-latency application API. Keep successful
// responses around long enough to absorb traffic spikes; publishing can still
// invalidate them immediately through /api/revalidate.
const GRAPHQL_CACHE_TTL = parseInt(process.env.GRAPHQL_CACHE_TTL || '1800', 10);

// The WordPress host's WAF (Cloudways) returns 403 for GraphQL requests whose
// Accept header is `application/json` or graphql-request v7's default
// `application/graphql-response+json` — only `Accept: */*` gets through. Without
// this override every server-side GraphQL call (page content, footer, global
// CSS) 403s and takes the whole site down. Verified: */* → 200, others → 403.
export const graphQLClient = new GraphQLClient(endpoint, {
  headers: { Accept: '*/*' },
});

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
  
  const cachedFn = unstable_cache(
    execute,
    ['graphql-request', cacheKey],
    {
      revalidate: GRAPHQL_CACHE_TTL,
      tags: [GRAPHQL_CACHE_TAG],
    }
  );

  // Do not retry the origin here. An error from unstable_cache normally means
  // the GraphQL request itself failed. Retrying the same expensive request
  // doubles both the visitor's timeout and WordPress/PHP load during an outage.
  return cachedFn();
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


async function fetchPageBySlug(slug, language = null) {
  const query = gql`
    query($uri: String!) {
      pageBy(uri: $uri) {
        id
        slug
        title
        content
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

/** Dedupes generateMetadata + page render in the same request */
export const getPageBySlug = cache(fetchPageBySlug);

// Get only greenshift plugin scripts.
// The accordion script is deliberately excluded: it declares top-level
// identifiers (e.g. `accordionItems`) and is not idempotent, so ScriptLoader's
// re-execute-on-navigation path throws "Identifier 'accordionItems' has already
// been declared". Accordion toggling is handled instead by the self-contained
// GreenShiftAccordion component (a faithful port of that same script), which is
// safe to run once and works even when WP fails to enqueue the script at all.
const EXCLUDED_GREENSHIFT_SCRIPTS = [/\/libs\/accordion\//i];

export function getGreenshiftScripts(edges) {
  const scripts = [];

  edges.forEach(({ node }) => {
    const { src } = node;

    if (!src || !src.includes('greenshift-animation-and-page-builder-blocks')) {
      return;
    }
    if (EXCLUDED_GREENSHIFT_SCRIPTS.some((re) => re.test(src))) {
      return;
    }
    scripts.push(src);
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
