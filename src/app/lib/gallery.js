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