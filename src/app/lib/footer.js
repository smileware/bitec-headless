import { GraphQLClient, gql } from "graphql-request";
const endpoint = process.env.API_DOMAIN || "https://wordpress-1328545-5763448.cloudwaysapps.com/graphql";
export const client = new GraphQLClient(endpoint);

// Server-side function to fetch footer data
export async function getFooterData() {
    const query = gql`
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
    
    try {
        const { reusableBlock } = await client.request(query);
        
        // Process the enqueued stylesheets and scripts
        const processedStyles = processEnqueuedStylesheets(reusableBlock?.enqueuedStylesheets?.edges || []);
        const processedScripts = processEnqueuedScripts(reusableBlock?.enqueuedScripts?.edges || []);
        
        return {
            ...reusableBlock,
            processedStyles,
            processedScripts
        };
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
