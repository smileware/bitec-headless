import { gql } from "graphql-request";
import { graphQLClient, getGreenshiftScripts, extractGreenshiftCss } from "./api";

export async function getHotelBySlug(slug) {
    console.log(slug);
    const query = gql`
        query GetHotelBySlug($slug: String!) {
            hotelBy(slug: $slug) {
                id
                slug
                title
                greenshiftInlineCss
                enqueuedStylesheets(first: 50) {
                    edges { node { handle, after } }
                }
                translations {
                    title
                    greenshiftInlineCss
                    enqueuedStylesheets(first: 50) {
                        edges { node { handle, after } }
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
    hotel.greenshiftInlineCss = extractGreenshiftCss(hotel);
    if (hotel.translations) {
        hotel.translations = hotel.translations.map(t => ({
            ...t,
            greenshiftInlineCss: extractGreenshiftCss(t),
        }));
    }
    return {
        ...hotel,
        greenshiftScripts,
    };
}
