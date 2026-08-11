import crypto from 'crypto';
import { cache } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
export const GRAPHQL_CACHE_TAG = 'wordpress-content';
const GRAPHQL_CACHE_TTL = readIntegerEnv('GRAPHQL_CACHE_TTL', 3600, 1);
const GRAPHQL_CACHE_JITTER = readIntegerEnv('GRAPHQL_CACHE_JITTER', 3600, 0);
const GRAPHQL_ORIGIN_TIMEOUT_MS = readIntegerEnv('GRAPHQL_ORIGIN_TIMEOUT_MS', 8000, 250);
const GRAPHQL_ORIGIN_CONCURRENCY = readIntegerEnv('GRAPHQL_ORIGIN_CONCURRENCY', 2, 1);
const GRAPHQL_SLOW_LOG_MS = readIntegerEnv('GRAPHQL_SLOW_LOG_MS', 1000, 0);
const GRAPHQL_DIAGNOSTICS = process.env.GRAPHQL_DIAGNOSTICS === 'true';

function readIntegerEnv(name, fallback, minimum) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isInteger(value) && value >= minimum ? value : fallback;
}

// The WordPress host's WAF (Cloudways) returns 403 for GraphQL requests whose
// Accept header is `application/json` or graphql-request v7's default
// `application/graphql-response+json` — only `Accept: */*` gets through. Without
// this override every server-side GraphQL call (page content, footer, global
// CSS) 403s and takes the whole site down. Verified: */* → 200, others → 403.
export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    Accept: '*/*',
    ...(process.env.WORDPRESS_GRAPHQL_SECRET
      ? { 'x-bitec-origin-key': process.env.WORDPRESS_GRAPHQL_SECRET }
      : {}),
  },
});

const rawGraphQLRequest = graphQLClient.request.bind(graphQLClient);
const supportsCache = typeof unstable_cache === 'function';
let activeOriginRequests = 0;
const originWaiters = [];
const inFlightGraphQLRequests = new Map();

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

function getOperationName(query) {
  const source = typeof query === 'string' ? query : String(query || '');
  return source.match(/\b(?:query|mutation)\s+([_A-Za-z][_0-9A-Za-z]*)/)?.[1]
    || 'AnonymousGraphQL';
}

function getJitteredTtl(cacheKey) {
  if (!Number.isFinite(GRAPHQL_CACHE_JITTER) || GRAPHQL_CACHE_JITTER <= 0) {
    return GRAPHQL_CACHE_TTL;
  }

  const bucket = Number.parseInt(cacheKey.slice(0, 8), 16);
  if (!Number.isFinite(bucket)) return GRAPHQL_CACHE_TTL;
  return GRAPHQL_CACHE_TTL + (bucket % (GRAPHQL_CACHE_JITTER + 1));
}

function normalizeTagValue(value) {
  return String(value || '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/_-]+/gu, '-')
    .slice(0, 160);
}

function inferCacheTags(operationName, variables = {}) {
  const lowerName = operationName.toLowerCase();
  let contentType = null;

  if (lowerName.includes('header') || lowerName.includes('menu')) contentType = 'navigation';
  else if (lowerName.includes('footer') || lowerName.includes('reusable')) contentType = 'footer';
  else if (lowerName.includes('gallery')) contentType = 'gallery';
  else if (lowerName.includes('hotel')) contentType = 'hotel';
  else if (lowerName.includes('event')) contentType = 'event';
  else if (lowerName.includes('post') || lowerName.includes('news')) contentType = 'post';
  else if (lowerName.includes('page')) contentType = 'page';

  const tags = new Set([GRAPHQL_CACHE_TAG, 'wp:all']);
  if (contentType) {
    tags.add(`wp:${contentType}`);
    const slug = normalizeTagValue(variables.slug || variables.uri);
    if (slug) tags.add(`wp:${contentType}:${slug}`);
  }
  return [...tags];
}

function createAbortError(message = 'GraphQL request aborted') {
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}

function acquireOriginSlot(signal) {
  if (signal?.aborted) return Promise.reject(createAbortError());

  if (activeOriginRequests < GRAPHQL_ORIGIN_CONCURRENCY) {
    activeOriginRequests += 1;
    return Promise.resolve(releaseOriginSlot);
  }

  return new Promise((resolve, reject) => {
    const waiter = { resolve, reject, signal, onAbort: null };
    waiter.onAbort = () => {
      const index = originWaiters.indexOf(waiter);
      if (index >= 0) originWaiters.splice(index, 1);
      reject(createAbortError());
    };
    signal?.addEventListener('abort', waiter.onAbort, { once: true });
    originWaiters.push(waiter);
  });
}

function releaseOriginSlot() {
  const waiter = originWaiters.shift();
  if (waiter) {
    waiter.signal?.removeEventListener('abort', waiter.onAbort);
    waiter.resolve(releaseOriginSlot);
    return;
  }
  activeOriginRequests = Math.max(0, activeOriginRequests - 1);
}

async function executeOriginRequest(query, variables, { signal, requestHeaders } = {}) {
  const operationName = getOperationName(query);
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', onAbort, { once: true });
  if (signal?.aborted) controller.abort(signal.reason);
  const timer = setTimeout(() => controller.abort(), GRAPHQL_ORIGIN_TIMEOUT_MS);
  const startedAt = performance.now();
  let release;

  try {
    release = await acquireOriginSlot(controller.signal);
    const data = await rawGraphQLRequest({
      document: query,
      variables,
      requestHeaders,
      signal: controller.signal,
    });
    const durationMs = Math.round(performance.now() - startedAt);
    if (GRAPHQL_DIAGNOSTICS || durationMs >= GRAPHQL_SLOW_LOG_MS) {
      console.info(`[graphql-origin] operation=${operationName} durationMs=${durationMs} outcome=ok`);
    }
    return data;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const cancelledByCaller = Boolean(signal?.aborted);
    if (cancelledByCaller) {
      if (GRAPHQL_DIAGNOSTICS) {
        console.info(
          `[graphql-origin] operation=${operationName} durationMs=${durationMs} outcome=cancelled`
        );
      }
    } else {
      console.error(
        `[graphql-origin] operation=${operationName} durationMs=${durationMs} outcome=error name=${error?.name || 'Error'}`
      );
    }
    throw error;
  } finally {
    release?.();
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

// Check if we're running on the client side
function isClientSide() {
  return typeof window !== 'undefined';
}

async function cachedGraphQLRequest(
  query,
  variables = {},
  { signal, requestHeaders, tags = [], validate } = {}
) {
  const operationName = getOperationName(query);
  let originCalled = false;
  const execute = async () => {
    originCalled = true;
    const data = await executeOriginRequest(query, variables, { signal, requestHeaders });
    if (validate && !validate(data)) {
      throw new Error(`GraphQL validation failed for ${operationName}`);
    }
    return data;
  };

  // Client components must use allowlisted same-origin content APIs. This guard
  // prevents a future hook from accidentally restoring public /graphql fan-out.
  if (isClientSide()) {
    throw new Error('Direct browser GraphQL requests are disabled');
  }

  if (process.env.SKIP_GRAPHQL_CACHE === 'true' || !supportsCache) {
    return execute();
  }

  const cacheKey = createCacheKey(query, variables);
  const cacheTags = [...new Set([...inferCacheTags(operationName, variables), ...tags])];
  const cachedFn = unstable_cache(
    execute,
    ['graphql-request-v2', cacheKey],
    {
      revalidate: getJitteredTtl(cacheKey),
      tags: cacheTags,
    }
  );

  const inFlight = inFlightGraphQLRequests.get(cacheKey);
  if (inFlight) {
    if (GRAPHQL_DIAGNOSTICS) {
      console.info(`[graphql-cache] operation=${operationName} source=coalesced`);
    }
    return inFlight;
  }

  const request = Promise.resolve().then(cachedFn);
  inFlightGraphQLRequests.set(cacheKey, request);

  try {
    const data = await request;
    if (GRAPHQL_DIAGNOSTICS) {
      console.info(
        `[graphql-cache] operation=${operationName} source=${originCalled ? 'miss' : 'hit'}`
      );
    }
    return data;
  } finally {
    if (inFlightGraphQLRequests.get(cacheKey) === request) {
      inFlightGraphQLRequests.delete(cacheKey);
    }
  }
}

graphQLClient.request = (documentOrOptions, variables, requestHeaders) => {
  if (
    documentOrOptions
    && typeof documentOrOptions === 'object'
    && 'document' in documentOrOptions
  ) {
    return cachedGraphQLRequest(
      documentOrOptions.document,
      documentOrOptions.variables || {},
      {
        signal: documentOrOptions.signal,
        requestHeaders: documentOrOptions.requestHeaders,
      }
    );
  }
  return cachedGraphQLRequest(documentOrOptions, variables, { requestHeaders });
};

export async function requestGraphQL(
  query,
  variables = {},
  { cache = true, signal, requestHeaders, tags = [], validate } = {}
) {
  if (cache === false) {
    const data = await executeOriginRequest(query, variables, { signal, requestHeaders });
    if (validate && !validate(data)) {
      throw new Error(`GraphQL validation failed for ${getOperationName(query)}`);
    }
    return data;
  }
  return cachedGraphQLRequest(query, variables, {
    signal,
    requestHeaders,
    tags,
    validate,
  });
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
    query GetPageBySlug($uri: String!) {
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
    console.error(`[wordpress-rest] operation=thai-page outcome=error name=${error?.name || 'Error'}`);
    return null;
  }
}
