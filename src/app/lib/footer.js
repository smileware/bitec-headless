import { gql } from "graphql-request";
import { requestGraphQL } from "./api";

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
// every page. The shared GraphQL wrapper caches only a validated response, so a
// WordPress blip cannot pin an empty footer.
async function getCachedFooterData({ signal } = {}) {
    const { reusableBlock } = await requestGraphQL(FOOTER_QUERY, {}, {
        signal,
        tags: ['wp:footer'],
        validate: (result) => Boolean(result?.reusableBlock?.content),
    });
    return {
        ...reusableBlock,
        processedStyles: processEnqueuedStylesheets(reusableBlock?.enqueuedStylesheets?.edges || []),
        processedScripts: processEnqueuedScripts(reusableBlock?.enqueuedScripts?.edges || []),
    };
}

// Server-side function to fetch footer data
export async function getFooterData({ throwOnError = false, signal } = {}) {
    try {
        return await getCachedFooterData({ signal });
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(`[footer] outcome=error name=${error?.name || 'Error'}`);
        }
        if (throwOnError) throw error;
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
