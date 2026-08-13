import { gql } from 'graphql-request';
import { cache } from 'react';
import { graphQLClient, requestGraphQL } from './api';

function normalizeWordPressSlug(slug) {
    // WordPress stores non-ASCII post_name values with lowercase percent
    // escapes, while Next route params can preserve uppercase escapes.
    return String(slug || '').replace(/%[0-9A-F]{2}/g, (escape) => escape.toLowerCase());
}

export const getGalleryBySlug = cache(getGalleryBySlugRaw);

async function getGalleryBySlugRaw(slug, language = 'en') {
    const normalizedSlug = normalizeWordPressSlug(slug);
    const query = gql`
        query GetGalleryBySlug($slug: String!) {
            galleryBy(slug: $slug) {
                id
                slug
                title
                date
                language {
                    code
                }
                galleryUpload {
                    fieldGroupName
                    galleryUpload {
                        nodes {
                            altText
                            sourceUrl
                        }
                    }
                }
                
                translations {
                    id
                    title
                    slug
                    date
                    language {
                        code
                    }
                    galleryUpload {
                        fieldGroupName
                        galleryUpload {
                            nodes {
                                altText
                                sourceUrl
                            }
                        }
                    }
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                            mediaDetails {
                                width
                                height
                            }
                        }
                    }
                    galleryTypes(first: 10) {
                        nodes {
                            id
                            name
                            slug
                        }
                    }
                }
                featuredImage {
                    node {
                        sourceUrl
                        altText
                        mediaDetails {
                            width
                            height
                        }
                    }
                }
                galleryTypes(first: 10) {
                    nodes {
                        id
                        name
                        slug
                    }
                }
            }
        }
    `;
    
    const variables = { slug: normalizedSlug };
    const data = await graphQLClient.request(query, variables);
    const gallery = data.galleryBy;
    
    if (!gallery) return null;

    const requestedLanguage = language === 'th' ? 'th' : 'en';
    const galleryLanguage = gallery.language?.code?.toLowerCase();
    const translatedGallery = galleryLanguage === requestedLanguage
        ? gallery
        : gallery.translations?.find(
            (translation) => translation.language?.code?.toLowerCase() === requestedLanguage
        );

    if (!translatedGallery) {
        return gallery;
    }

    return {
        ...gallery,
        ...translatedGallery,
        featuredImage: translatedGallery.featuredImage || gallery.featuredImage,
        galleryUpload: translatedGallery.galleryUpload || gallery.galleryUpload,
        galleryTypes: translatedGallery.galleryTypes || gallery.galleryTypes,
        translations: gallery.translations,
    };
} 


export async function GetGalleryByTaxonomyType(
    taxonomySlug,
    limit = 12,
    after = null,
    options = {}
) {
    const language = options.language === 'th' ? 'th' : 'en';
    const query = `
        query GalleriesByType(
            $slug: [String]
            $first: Int
            $after: String
            $language: String!
        ) {
            galleries(
                where: { 
                    language: $language
                    taxQuery: {
                        taxArray: [
                            {
                                taxonomy: GALLERYTYPE
                                field: SLUG
                                terms: $slug
                            }
                        ]
                    }
                }
                first: $first
                after: $after
            ) {
                nodes {
                    id
                    title
                    slug
                    date
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                            mediaDetails {
                                width
                                height
                            }
                        }
                    }
                    galleryUpload {
                        fieldGroupName
                        galleryUpload {
                            nodes {
                                altText
                                sourceUrl
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    `;

    const variables = {
        slug: [taxonomySlug],
        first: limit,
        after: after,
        language,
    };

    const data = await requestGraphQL(query, variables, options);

    if (!data?.galleries?.nodes) {
        return { galleries: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    return {
        galleries: data.galleries.nodes,
        pageInfo: data.galleries.pageInfo,
    };
}

export async function getGalleryTypeBySlug(slug, options = {}) {
    const query = `
        query GalleryTypeBySlug($slug: [String]) {
            galleryTypes(where: { slug: $slug }) {
                nodes {
                    id
                    name
                    slug
                    description
                }
            }
        }
    `;
    const variables = { slug: [slug] };
    const data = await requestGraphQL(query, variables, options);
    return data.galleryTypes?.nodes?.[0] || null;
}
