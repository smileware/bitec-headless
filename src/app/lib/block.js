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
    const galleryBlock = blocks.find((block) => block?.blockQueryGalleryByType);

    if (!galleryBlock) {
        console.log("No gallery block found");
        return null;
    }

    const blockData = galleryBlock.blockQueryGalleryByType;

    // Extract the first taxonomy term from the edges
    const taxonomyTerm = blockData.queryGalleryByType?.edges?.[0]?.node;
    const result = {
        queryGalleryByType: taxonomyTerm?.slug || null,
        queryGalleryTitle: blockData.queryGalleryTitle,
        queryGalleryDescription: blockData.queryGalleryDescription,
        queryGalleryLink: blockData.queryGalleryLink,
    };
    return result;
}

export async function GetGalleryByTaxonomyType(taxonomySlug, limit = 12) {
    // Query galleries filtered by taxonomy slug
    const taxonomyQuery = gql`
        query GetGalleryByTaxonomyType($taxonomySlug: [String]!, $limit: Int!) {
            galleries(
                where: {
                    taxQuery: {
                        taxArray: [
                            {
                                taxonomy: GALLERYTYPE
                                terms: $taxonomySlug
                                field: SLUG
                                operator: IN
                            }
                        ]
                    }
                }
                first: $limit
            ) {
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
                    translations {
                        title
                        slug
                        date
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(taxonomyQuery, {
            taxonomySlug: [taxonomySlug],
            limit,
        });
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
    const tabBlock = blocks.find((block) => block?.blockTabToAccordion);

    if (!tabBlock) {
        console.log("No tab to accordion block found");
        return null;
    }

    const blockData = tabBlock.blockTabToAccordion;
    const tabs = (blockData.tabToAccordion || []).map((tab) => {
        return {
            tabButton: tab.tabButton || "",
            tabImage: tab.tabImageContent?.node?.sourceUrl || null,
            altText: tab.tabImageContent?.node?.altText || tab.tabButton || "",
            imageDetails: tab.tabImageContent?.node?.mediaDetails || null,
        };
    });

    return {
        title: blockData.tabToAccordionTitle || "",
        tabs: tabs,
    };
}

export async function GetPageWithEventHallCarousel(slug) {
    const query = gql`
        query GetPageWithEventHallCarousel($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfEventHallCarousel {
                        blockEventHallCarousel {
                            eventHallCarousel {
                                eventHallImage {
                                    node {
                                        sourceUrl
                                        altText
                                        mediaDetails {
                                            width
                                            height
                                        }
                                    }
                                }
                                eventHallTitle
                                eventHallSize
                                eventHallTags {
                                    tagName
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
    const eventHallBlocks = blocks.filter(
        (block) => block?.blockEventHallCarousel
    );

    if (eventHallBlocks.length === 0) {
        console.log("No event hall carousel blocks found");
        return null;
    }

    // Process all blocks and return them as separate items
    const allEventHalls = eventHallBlocks.map((block, blockIndex) => {
        const blockData = block.blockEventHallCarousel;
        
        const eventHalls = (blockData.eventHallCarousel || []).map((eventHall, hallIndex) => {
            return {
                id: `event-hall-${blockIndex}-${hallIndex}`,
                blockIndex: blockIndex,
                image: eventHall.eventHallImage?.node?.sourceUrl || null,
                altText:
                    eventHall.eventHallImage?.node?.altText ||
                    eventHall.eventHallTitle ||
                    "",
                title: eventHall.eventHallTitle || "",
                size: eventHall.eventHallSize || "",
                tags: (eventHall.eventHallTags || []).map(
                    (tag) => tag.tagName || ""
                ),
            };
        });
        
        return eventHalls;
    });

    // Flatten the array to get all event halls from all blocks
    const eventHalls = allEventHalls.flat();

    return {
        eventHalls: eventHalls,
    };
}

export async function GetPageWithBitecLiveHallCarousel(slug) {
    const query = gql`
        query GetPageWithBitecLiveHallCarousel($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfBitecLiveHallCarousel {
                        blockBitecLiveHallCarousel {
                            bitecLiveHallGallery {
                                nodes {
                                    id
                                    mediaItemUrl
                                    altText
                                    caption
                                }
                            }
                            bitecLiveHallTitle
                            bitecLiveHallSize
                            bitecLiveHallCapacity
                            bitecLiveHallLink {
                                url
                                title
                                target
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
    const bitecLiveHallBlock = blocks.find(
        (block) => block?.blockBitecLiveHallCarousel
    );
    
    if (!bitecLiveHallBlock) {
        console.log("No BitecLive hall carousel block found");
        return null;
    }
    
    const blockData = bitecLiveHallBlock.blockBitecLiveHallCarousel;
    
    // Since the structure is now direct (no bitecLiveHallCarousel wrapper)
    const gallery = (blockData.bitecLiveHallGallery?.nodes || []).map((node) => ({
        url: node.mediaItemUrl,
        alt: node.altText || "",
        caption: node.caption || "",
    }));
    
    const bitecLiveHall = {
        gallery: gallery,
        title: blockData.bitecLiveHallTitle || "",
        size: blockData.bitecLiveHallSize || "",
        capacity: blockData.bitecLiveHallCapacity || "",
        link: blockData.bitecLiveHallLink?.url || "",
        linkTitle: blockData.bitecLiveHallLink?.title || "",
        linkTarget: blockData.bitecLiveHallLink?.target || "",
    };
    
    return {
        bitecLiveHalls: [bitecLiveHall], // Return as array to maintain compatibility
    };
}

export async function GetPageWithPhotoGallery(slug) {
    const query = gql`
        query GetPageWithPhotoGallery($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfPhotoGallery {
                        blockPhotoGallery {
                            photoGallery {
                                nodes {
                                    id
                                    mediaItemUrl
                                    altText
                                    caption
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
    `;
    const variables = { uri: slug };
    let data;
    try {
        data = await graphQLClient.request(query, variables);
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return { photoGalleries: [] };
    }
    
    const blocks = data?.pageBy?.editorBlocks || [];
    const photoGalleryBlocks = blocks.filter((block) => block?.blockPhotoGallery);
    
    if (photoGalleryBlocks.length === 0) {
        return { photoGalleries: [] };
    }
    
    const photoGalleries = photoGalleryBlocks.map((block, blockIndex) => {
        const blockData = block.blockPhotoGallery;
        const gallery = blockData.photoGallery?.nodes || [];
        const images = gallery.map((node) => ({
            id: node.id,
            url: node.mediaItemUrl,
            alt: node.altText || "",
            caption: node.caption || "",
            width: node.mediaDetails?.width || 0,
            height: node.mediaDetails?.height || 0,
        }));
        
        return {
            blockIndex: blockIndex,
            photoGallery: {
                nodes: images
            }
        };
    });
    
    return { photoGalleries: photoGalleries };
}

export async function GetHotels(limit = 8) {
    const query = gql`
        query GetHotels($limit: Int!) {
            hotels(
                first: $limit
                where: { orderby: { field: DATE, order: DESC } }
            ) {
                nodes {
                    id
                    title
                    slug
                    excerpt
                    date
                    hotelDetail {
                        hotelShortAddress
                        hotelTransportation
                    }
                    hotelCategories {
                        nodes {
                            id
                            name
                            slug
                        }
                    }
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
                    translations {
                        title
                        slug
                        excerpt
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(query, { limit });
        return data?.hotels?.nodes || [];
    } catch (error) {
        console.error("GraphQL fetch error for hotels:", error);
        return [];
    }
}

export async function GetRecommendedHotels(limit = 8) {
    const query = gql`
        query GetRecommendedHotels($limit: Int!) {
            hotels(
                first: $limit
                where: { 
                    orderby: { field: DATE, order: DESC }
                    taxQuery: {
                        taxArray: [
                            {
                                taxonomy: HOTELCATEGORY
                                terms: ["recommend"]
                                field: SLUG
                                operator: IN
                            }
                        ]
                    }
                }
            ) {
                nodes {
                    id
                    title
                    slug
                    excerpt
                    date
                    hotelDetail {
                        hotelShortAddress
                        hotelTransportation
                    }
                    hotelCategories {
                        nodes {
                            id
                            name
                            slug
                        }
                    }
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
                    translations {
                        title
                        slug
                        excerpt
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(query, { limit });
        return data?.hotels?.nodes || [];
    } catch (error) {
        console.error("GraphQL fetch error for recommended hotels:", error);
        return [];
    }
}

export async function GetAllHotels() {
    const query = gql`
        query GetAllHotels {
            hotels(
                first: 100
                where: { orderby: { field: DATE, order: DESC } }
            ) {
                nodes {
                    id
                    title
                    slug
                    excerpt
                    date
                    hotelDetail {
                        hotelShortAddress
                        hotelTransportation
                        latitude
                        longitude
                    }
                    hotelCategories {
                        nodes {
                            id
                            name
                            slug
                        }
                    }
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
                    translations {
                        title
                        slug
                        excerpt
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(query);
        return data?.hotels?.nodes || [];
    } catch (error) {
        console.error("GraphQL fetch error for hotels with coordinates:", error);
        return [];
    }
}
