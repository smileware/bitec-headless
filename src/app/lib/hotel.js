import { gql } from "graphql-request";
import { graphQLClient, getGreenshiftScripts } from "./api";

export async function getHotelBySlug(slug) {
    console.log(slug);
    const query = gql`
        query GetHotelBySlug($slug: String!) {
            hotelBy(slug: $slug) {
                id
                slug
                title
                greenshiftInlineCss
                translations {
                    title
                }
                enqueuedScripts(first: 100) {
                    edges {
                        node {
                            src
                            after
                        }
                    }
                }
                featuredImage {
                    node {
                        sourceUrl
                        altText
                    }
                }
                hotelDetail {
                    hotelShortAddress
                    hotelAddress
                    hotelTransportation
                    hotelPhoneNumber
                    hotelEmail
                    hotelWebsite {
                        url
                        title
                        target
                    }
                    hotelBookingUrl {
                        url
                        title
                        target
                    }
                    hotelGallery {
                        nodes {
                            sourceUrl
                            altText
                        }
                    }
                    hotelMapIframe
                    hotelContent {
                        contentTitle
                        hotelContent
                    }
                }
                hotelCategories(first: 10) {
                    nodes {
                        id
                        name
                    }
                }
            }
        }
    `;

    const variables = { slug };
    const data = await graphQLClient.request(query, variables);
    const hotel = data.hotelBy;

    if (!hotel) return null;
    const greenshiftScripts = getGreenshiftScripts(
        hotel.enqueuedScripts?.edges || []
    );
    return {
        ...hotel,
        greenshiftScripts,
    };
}
