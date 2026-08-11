import { GraphQLClient, gql } from "graphql-request";
import { unstable_cache } from "next/cache";
import { GRAPHQL_CACHE_TAG } from "./api";
const endpoint = process.env.API_DOMAIN || "https://wordpress-1328545-5763448.cloudwaysapps.com/graphql";
// Accept: */* required — the host WAF 403s application/json & the graphql-request
// v7 default. See the note in lib/api.js.
export const client = new GraphQLClient(endpoint, { headers: { Accept: '*/*' } });

const FOOTER_QUERY = gql`
    query GetFooterReusableBlock {
        reusableBlock(id: "theme-footer", idType: SLUG) {
            content
            translations {
                content
            }
            enqueuedStylesheets(first: 100) {
                edges {
                    node {
                        src
                        after
                    }
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
        }
    }
`;

// The footer is the same reusable block on every page and rarely changes, but it
// was refetched from WordPress on every request (no cache), adding latency to
// every page. Cache the processed result and revalidate periodically; a failed
// fetch is NOT cached (the throw propagates out of unstable_cache), so a WP blip
// won't get pinned as an empty footer.
const getCachedFooterData = unstable_cache(
    async () => {
        const { reusableBlock } = await client.request(FOOTER_QUERY);
        return {
            ...reusableBlock,
            processedStyles: processEnqueuedStylesheets(reusableBlock?.enqueuedStylesheets?.edges || []),
            processedScripts: processEnqueuedScripts(reusableBlock?.enqueuedScripts?.edges || []),
        };
    },
    ['footer-reusable-block'],
    { revalidate: 1800, tags: [GRAPHQL_CACHE_TAG] }
);

// Server-side function to fetch footer data
export async function getFooterData() {
    try {
        return await getCachedFooterData();
    } catch (error) {
        console.error('Error fetching footer data:', error);
        return {
            content: '',
            processedStyles: [],
            processedScripts: []
        };
    }
}

function processEnqueuedStylesheets(edges) {
    const validStyles = [];
    
    edges.forEach(({ node }) => {
        const { src, after } = node;
        
        if (src && src.endsWith('.css')) {
            return;
        }
        if (after) {
            validStyles.push({
                src,
                after
            });
        }
    });
    
    return validStyles;
}

function processEnqueuedScripts(edges) {
    const validScripts = [];
    
    edges.forEach(({ node }) => {
        const { src, after } = node;
        
        // Include FluentForm related scripts
        if (src && (src.includes('fluentform') || src.includes('fluent-form'))) {
            validScripts.push({
                src,
                after,
                type: 'external'
            });
        }
        
        // Include inline scripts that have 'after' parameter
        if (after && after.includes('fluentform')) {
            validScripts.push({
                src,
                after,
                type: 'inline'
            });
        }
    });
    
    return validScripts;
}

// Helper function to generate style tags for the processed styles
export function generateStyleTags(processedStyles) {
    return processedStyles.map(style => {
        if (style.src) {
            // For external stylesheets
            return `<link rel="stylesheet" href="${style.src}" />`;
        } else if (style.after) {
            // For inline styles
            return `<style>${style.after}</style>`;
        }
        return '';
    }).join('\n');
}

// Helper function to generate script tags for the processed scripts
export function generateScriptTags(processedScripts) {
    return processedScripts.map(script => {
        if (script.type === 'external' && script.src) {
            // For external scripts
            return `<script src="${script.src}"></script>`;
        } else if (script.type === 'inline' && script.after) {
            // For inline scripts
            return `<script>${script.after}</script>`;
        }
        return '';
    }).join('\n');
}
