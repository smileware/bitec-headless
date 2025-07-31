import { gql } from "graphql-request";
import { graphQLClient } from "./api";

export async function GetPageWithBitecLiveGallery(slug) {
    const query = gql`
        query GetPageWithBitecLiveGallery($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfBitecLiveGallery {
                        blockBitecLiveGallery {
                            bitecLiveGallery {
                                nodes {
                                    id
                                    mediaItemUrl
                                    altText
                                    caption
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { uri: slug };
    let data;
    try {
        data = await graphQLClient.request(query, variables);
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return [];
    }
    // Find the AcfBitecLiveGallery block with images
    const blocks = data?.pageBy?.editorBlocks || [];
    const galleryBlock = blocks.find(
        (block) =>
            block?.blockBitecLiveGallery?.bitecLiveGallery?.nodes?.length > 0
    );
    if (!galleryBlock) {
        return [];
    }
    const nodes = galleryBlock.blockBitecLiveGallery.bitecLiveGallery.nodes;
    // Map to array of image objects
    const images = nodes.map((node) => ({
        url: node.mediaItemUrl,
        alt: node.altText || "",
        caption: node.caption || "",
    }));
    return images;
}

export async function GetPageWithBitecLiveFacilities(slug) {
    const query = gql`
        query GetPageWithBitecLiveFacilities($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfBitecLiveFacilities {
                        blockBitecLiveFacilities {
                            bitecLiveFacilities {
                                facilityName
                                facilityImage {
                                    node {
                                        id
                                        sourceUrl
                                        altText
                                        mimeType
                                        mediaDetails {
                                            width
                                            height
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { uri: slug };
    let data;
    try {
        data = await graphQLClient.request(query, variables);
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return [];
    }
    const blocks = data?.pageBy?.editorBlocks || [];
    // Find all facilities arrays and flatten them
    const facilitiesArrays = blocks
        .map((block) => block?.blockBitecLiveFacilities?.bitecLiveFacilities)
        .filter(Boolean);
    const facilities = facilitiesArrays.flat().map((facility) => ({
        name: facility.facilityName || "",
        image: facility.facilityImage || "",
    }));
    return facilities;
}

export async function GetPageWithQueryGalleryByType(slug) {
    const query = gql`
        query GetPageWithQueryGalleryByType($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfQueryGalleryByType {
                        blockQueryGalleryByType {
                            fieldGroupName
                            queryGalleryDescription
                            queryGalleryTitle
                            queryGalleryLink {
                                target
                                title
                                url
                            }
                            queryGalleryByType {
                                edges {
                                    node {
                                        id
                                        name
                                        slug
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { uri: slug };
    let data;
    try {
        data = await graphQLClient.request(query, variables);
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return null;
    }
    const blocks = data?.pageBy?.editorBlocks || [];
    const galleryBlock = blocks.find(
        (block) => block?.blockQueryGalleryByType
    );
    
    if (!galleryBlock) {
        console.log('No gallery block found');
        return null;
    }
    
    const blockData = galleryBlock.blockQueryGalleryByType;
    
    // Extract the first taxonomy term from the edges
    const taxonomyTerm = blockData.queryGalleryByType?.edges?.[0]?.node;
    const result = {
        queryGalleryByType: taxonomyTerm?.slug || null,
        queryGalleryTitle: blockData.queryGalleryTitle,
        queryGalleryDescription: blockData.queryGalleryDescription,
        queryGalleryLink: blockData.queryGalleryLink
    };
    return result;
}

export async function GetGalleryByTaxonomyType(taxonomySlug, limit = 12) {
    // Query galleries filtered by taxonomy slug
    const taxonomyQuery = gql`
        query GetGalleryByTaxonomyType($taxonomySlug: [String]!, $limit: Int!) {
            galleries(where: { taxQuery: { taxArray: [{ taxonomy: GALLERYTYPE, terms: $taxonomySlug, field: SLUG, operator: IN }] } }, first: $limit) {
                nodes {
                    id
                    title
                    slug
                    date
                    featuredImage {
                        node {
                            id
                            sourceUrl
                            altText
                            mediaDetails {
                                width
                                height
                            }
                        }
                    }
                    translations{
                        title
                        slug
                        date
                    }
                }
            }
        }
    `;
    
    try {
        const data = await graphQLClient.request(taxonomyQuery, { taxonomySlug: [taxonomySlug], limit });
        return data?.galleries?.nodes || [];
    } catch (error) {
        console.error("GraphQL fetch error for gallery items:", error);
    }
}

export async function GetPageWithTabToAccordion(slug) {
    const query = gql`
        query GetPageWithTabToAccordion($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfTabToAccordion {
                        blockTabToAccordion {
                            tabToAccordionTitle
                            tabToAccordion {
                                tabButton
                                tabImageContent {
                                    node {
                                        id
                                        sourceUrl
                                        altText
                                        mediaDetails {
                                            width
                                            height
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { uri: slug };
    let data;
    try {
        data = await graphQLClient.request(query, variables);
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return null;
    }
    const blocks = data?.pageBy?.editorBlocks || [];
    const tabBlock = blocks.find(
        (block) => block?.blockTabToAccordion
    );
    
    if (!tabBlock) {
        console.log('No tab to accordion block found');
        return null;
    }
    
    const blockData = tabBlock.blockTabToAccordion;
    const tabs = (blockData.tabToAccordion || []).map(tab => {
        return {
            tabButton: tab.tabButton || '',
            tabImage: tab.tabImageContent?.node?.sourceUrl || null,
            altText: tab.tabImageContent?.node?.altText || tab.tabButton || '',
            imageDetails: tab.tabImageContent?.node?.mediaDetails || null
        };
    });
    
    return {
        title: blockData.tabToAccordionTitle || '',
        tabs: tabs
    };
}
