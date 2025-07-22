import { gql } from 'graphql-request';
import { graphQLClient, getGreenshiftScripts } from './api';

export async function getGalleryBySlug(slug) {
    const query = gql`
        query GetGalleryBySlug($slug: String!) {
            galleryBy(slug: $slug) {
                id
                slug
                title
                date
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
                    title
                    slug
                    date
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
    
    const variables = { slug };
    const data = await graphQLClient.request(query, variables);
    const gallery = data.galleryBy;
    
    if (!gallery) return null;
    return {
        ...gallery
    };
} 


export async function GetGalleryByTaxonomyType(taxonomySlug, limit = 12, after = null) {
    const query = `
        query GalleriesByType($slug: [String], $first: Int, $after: String) {
            galleries(
                where: { 
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
    };

    const data = await graphQLClient.request(query, variables);

    if (!data?.galleries?.nodes) {
        return { galleries: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    return {
        galleries: data.galleries.nodes,
        pageInfo: data.galleries.pageInfo,
    };
}

export async function getGalleryTypeBySlug(slug) {
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
    const data = await graphQLClient.request(query, variables);
    return data.galleryTypes?.nodes?.[0] || null;
}