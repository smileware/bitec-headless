import { gql } from "graphql-request";
import { graphQLClient } from "./api";

export async function GetPageWithBitecLiveGallery(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithBitecLiveGallery($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
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
    // Manage Translate Content.
    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;
    // const blocks = data?.pageBy?.editorBlocks || [];

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

export async function GetPageWithBitecLiveFacilities(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithBitecLiveFacilities($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
                    editorBlocks {
                        ... on AcfBitecLiveFacilities {
                            blockBitecLiveFacilities {
                                bitecLiveFacilities {
                                    facilityName
                                    facilityDescription
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
                                    facilityGallery {
                                        nodes {
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
                editorBlocks {
                    ... on AcfBitecLiveFacilities {
                        blockBitecLiveFacilities {
                            bitecLiveFacilities {
                                facilityName
                                facilityDescription
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
                                facilityGallery {
                                    nodes {
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
        return [];
    }

    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;

    // const blocks = data?.pageBy?.editorBlocks || [];
    // Find all facilities arrays and flatten them
    const facilitiesArrays = blocks
        .map((block) => block?.blockBitecLiveFacilities?.bitecLiveFacilities)
        .filter(Boolean);
    const facilities = facilitiesArrays.flat().map((facility) => ({
        name: facility.facilityName || "",
        image: facility.facilityImage || "",
        description: facility.facilityDescription || "", 
        gallery: facility.facilityGallery?.nodes || []
    }));
    return facilities;
}

export async function GetPageWithQueryGalleryByType(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithQueryGalleryByType($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
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

    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;

    // const blocks = data?.pageBy?.editorBlocks || [];
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
        return [];
    }
}

export async function GetPageWithDisplayGalleryByType(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithDisplayGalleryByType($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
                    editorBlocks {
                        ... on AcfGallery {
                            blockDisplayGalleryByType {
                                fieldGroupName
                                displayGalleryByType {
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
                editorBlocks {
                    ... on AcfGallery {
                        blockDisplayGalleryByType {
                            fieldGroupName
                            displayGalleryByType {
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
    
    try {
        const data = await graphQLClient.request(query, variables);
        const baseBlocks = data?.pageBy?.editorBlocks || [];
        const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
        const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;
        
        const galleryBlock = blocks.find((block) => block?.blockDisplayGalleryByType);
        
        if (!galleryBlock) {
            console.log("No display gallery block found");
            return null;
        }
        
        const blockData = galleryBlock.blockDisplayGalleryByType;
        
        // Extract all selected taxonomy terms (can be multiple since it's checkbox)
        const selectedTypes = blockData.displayGalleryByType?.edges?.map(edge => edge.node.slug) || [];
        
        return {
            displayGalleryByType: selectedTypes.length > 0 ? selectedTypes : null,
        };
    } catch (error) {
        console.error("GraphQL fetch error:", error);
        return null;
    }
}

export async function GetGalleriesByTypes(typeSlugs = null, limit = 12) {
    // Query with filters
    const queryWithFilter = gql`
        query GetGalleriesByTypes($typeSlugs: [String]!, $limit: Int!) {
            galleries(
                where: {
                    taxQuery: {
                        taxArray: [
                            {
                                taxonomy: GALLERYTYPE
                                terms: $typeSlugs
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
    
    // Query without filters (get all)
    const queryAll = gql`
        query GetAllGalleries($limit: Int!) {
            galleries(first: $limit) {
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
        let data;
        
        if (typeSlugs && typeSlugs.length > 0) {
            // Fetch galleries by selected types
            console.log('Fetching galleries by types:', typeSlugs);
            data = await graphQLClient.request(queryWithFilter, {
                typeSlugs: typeSlugs,
                limit,
            });
        } else {
            // No types selected, fetch all galleries
            console.log('No types selected, fetching all galleries');
            data = await graphQLClient.request(queryAll, {
                limit,
            });
        }
        
        return data?.galleries?.nodes || [];
    } catch (error) {
        console.error("GraphQL fetch error for galleries:", error);
        return [];
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

export async function GetPageWithEventHallCarousel(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithEventHallCarousel($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
                    editorBlocks {
                        ... on AcfEventHallCarousel {
                            blockEventHallCarousel {
                                blockIdentifierId
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
                                    eventHallDescription
                                    eventHallSize
                                    eventHallTags {
                                        tagName
                                    }
                                    eventHallGallery {
                                        nodes {
                                            sourceUrl
                                            altText
                                            mediaDetails {
                                                width
                                                height
                                            }
                                        }
                                    }
                                    eventHallDetail { 
                                        iconImage {
                                            node {
                                                sourceUrl
                                                altText
                                                mediaDetails {
                                                    width
                                                    height
                                                }
                                            }
                                        }
                                        iconSvg
                                        iconDetail
                                    }
                                }
                            }
                        }
                    }
                }
                editorBlocks {
                    ... on AcfEventHallCarousel {
                        blockEventHallCarousel {
                            blockIdentifierId
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
                                eventHallDescription
                                eventHallSize
                                eventHallTags {
                                    tagName
                                }
                                eventHallGallery {
                                    nodes {
                                        sourceUrl
                                        altText
                                        mediaDetails {
                                            width
                                            height
                                        }
                                    }
                                }
                                eventHallDetail { 
                                    iconImage {
                                        node {
                                            sourceUrl
                                            altText
                                            mediaDetails {
                                                width
                                                height
                                            }
                                        }
                                    }
                                    iconSvg
                                    iconDetail
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

    // Manage Translate Content.
    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;

    const eventHallBlocks = blocks.filter(
        (block) => block?.blockEventHallCarousel
    );

    if (eventHallBlocks.length === 0) {
        console.log("No event hall carousel blocks found");
        return null;
    }

    // Process all blocks and return them as separate items
    // IMPORTANT: Preserve the order - blockIndex 0 = first block, blockIndex 1 = second block, etc.
    const allEventHalls = eventHallBlocks.map((block, blockIndex) => {
        const blockData = block.blockEventHallCarousel;
        const blockIdentifierId = blockData.blockIdentifierId || null;
        
        const eventHalls = (blockData.eventHallCarousel || []).map((eventHall, hallIndex) => {
            return {
                id: `event-hall-${blockIndex}-${hallIndex}`,
                blockIndex: blockIndex,
                blockIdentifierId: blockIdentifierId, // Include the identifier
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
                description: eventHall.eventHallDescription || "",
                gallery: eventHall.eventHallGallery?.nodes || [],
                detail: eventHall.eventHallDetail || []
            };
        });
        
        return eventHalls;
    });
    
    // Create a mapping of blockIndex to blockIdentifierId in order
    // This preserves the relationship: blockIndex 0 → first identifier, blockIndex 1 → second identifier
    const blockIndexToIdentifier = {};
    eventHallBlocks.forEach((block, index) => {
        const blockIdentifierId = block.blockEventHallCarousel?.blockIdentifierId;
        if (blockIdentifierId) {
            blockIndexToIdentifier[index] = blockIdentifierId;
        }
    });

    // Flatten the array to get all event halls from all blocks
    const eventHalls = allEventHalls.flat();

    return {
        eventHalls: eventHalls,
        blockIndexToIdentifier: blockIndexToIdentifier, // Include the mapping
    };
}

export async function GetPageWithBitecLiveHallCarousel(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithBitecLiveHallCarousel($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
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

    // Manage Translate Content.
    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;

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

export async function GetPageWithPhotoGallery(slug, preferTranslation = false) {
    const query = gql`
        query GetPageWithPhotoGallery($uri: String!) {
            pageBy(uri: $uri) {
                translations { 
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
    

    // Manage Translate Content.
    const baseBlocks = data?.pageBy?.editorBlocks || [];
    const transBlocks = data?.pageBy?.translations?.[0]?.editorBlocks || [];
    const blocks = (preferTranslation && transBlocks?.length) ? transBlocks : baseBlocks;

    // const blocks = data?.pageBy?.editorBlocks || [];
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

export async function GetPageWithSimpleGalleryCarousel(slug) {
    const query = gql`
        query GetPageWithSimpleGalleryCarousel($uri: String!) {
            pageBy(uri: $uri) {
                editorBlocks {
                    ... on AcfSimpleGalleryCarousel {
                        blockSimpleGalleryCarousel {
                            simpleGalleryCarousel {
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
        return { simpleGalleryCarousels: [] };
    }
    
    const blocks = data?.pageBy?.editorBlocks || [];
    const simpleGalleryCarouselBlocks = blocks.filter((block) => block?.blockSimpleGalleryCarousel);
    
    if (simpleGalleryCarouselBlocks.length === 0) {
        return { simpleGalleryCarousels: [] };
    }
    
    const simpleGalleryCarousels = simpleGalleryCarouselBlocks.map((block, blockIndex) => {
        const blockData = block.blockSimpleGalleryCarousel;
        const gallery = blockData.simpleGalleryCarousel?.nodes || [];
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
            simpleGalleryCarousel: {
                nodes: images
            }
        };
    });
    
    return { simpleGalleryCarousels: simpleGalleryCarousels };
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

export async function GetRecommendedHotels(limit = 8, isTH = false) {
    const terms = isTH ? ["recommend-th"] : ["recommend", "highlight"];
    const query = gql`
        query GetRecommendedHotels($limit: Int!, $terms: [String]) {
            hotels(
                first: $limit
                where: { 
                    orderby: { field: DATE, order: DESC }
                    taxQuery: {
                        taxArray: [
                            {
                                taxonomy: HOTELCATEGORY
                                terms: $terms
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
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(query, { limit, terms });
        const nodes = data?.hotels?.nodes || [];
      
        if (!isTH) return nodes;
      
        return nodes.map(h => {
            const t = h.translations?.[0];
            if (!t) return h; 
            return {
                ...h,
                title: t.title ?? h.title,
                slug: t.slug ?? h.slug,
                excerpt: t.excerpt ?? h.excerpt,
                date: t.date ?? h.date,
                hotelDetail: t.hotelDetail ?? h.hotelDetail,
                hotelCategories: t.hotelCategories ?? h.hotelCategories,
                featuredImage: t.featuredImage ?? h.featuredImage,
            };
        });
        
    } catch (error) {
        console.error("GraphQL fetch error for recommended hotels:", error);
        return [];
    }
}

export async function GetAllHotels(isTH = false) {
    const query = gql`
        query GetAllHotels {
            hotels(
                first: 200
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
                    }
                }
            }
        }
    `;

    try {
        const data = await graphQLClient.request(query);
        const nodes = data?.hotels?.nodes || [];
    
        // EN (default)
        if (!isTH) return nodes;
    
        // TH: override fields with the first translation (WPGraphQL returns “other locales” here)
        return nodes.map(h => {
          const t = h.translations?.[0];
          if (!t) return h; // fallback to base if no TH
          return {
            ...h,
            title: t.title ?? h.title,
            slug: t.slug ?? h.slug,
            excerpt: t.excerpt ?? h.excerpt,
            date: t.date ?? h.date,
            hotelDetail: t.hotelDetail ?? h.hotelDetail,
            hotelCategories: t.hotelCategories ?? h.hotelCategories,
            featuredImage: t.featuredImage ?? h.featuredImage,
          };
        });
    } catch (error) {
        console.error("GraphQL fetch error for hotels with coordinates:", error);
        return [];
    }
}


export async function GetAllCategories(isTH = false) {
    const query = gql`
      query GetAllCategories {
        hotelCategories {
          nodes {
            id
            name
            slug
            count
            translations {
              id
              name
              slug
              count
            }
          }
        }
      }
    `;
    
    try {
        const data = await graphQLClient.request(query);
        const nodes = data?.hotelCategories?.nodes ?? [];
        const cats = nodes
            .map(c => {
                const t = isTH && c.translations?.[0] ? c.translations[0] : null;
                return {
                id: t?.id ?? c.id,
                name: t?.name ?? c.name,
                slug: t?.slug ?? c.slug,
                count: (isTH ? t?.count : c.count) ?? 0,
                };
            })
            .filter(c => c.count > 0); // ✅ only categories that have posts
        return cats.map(({ count, ...rest }) => rest);

    } catch (error) {
        console.error("GraphQL fetch error for hotels with coordinates:", error);
        return [];
    }
}