import { gql } from 'graphql-request';
import { graphQLClient, getGreenshiftScripts } from './api';

export async function getEventBySlug(slug) {
    const query = gql`
        query GetEventBySlug($slug: String!) {
            eventBy(slug: $slug) {
                id
                slug
                title
                content
                greenshiftInlineCss
                translations {
                    content
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
                eventFieldGroup {
                    eventEnddate
                    eventHall
                    eventStartdate
                    fieldGroupName
                }
                eventCategories(first: 10) {
                    nodes {
                        id
                        name
                    }
                }
                eventLocation(first: 10) {
                    nodes {
                        id
                        name
                        taxonomyEventLocation {
                            eventLocationColor
                        }
                    }
                }
            }
        }
    `;
    
    const variables = { slug };
    const data = await graphQLClient.request(query, variables);
    const event = data.eventBy;
    
    if (!event) return null;
    const greenshiftScripts = getGreenshiftScripts(event.enqueuedScripts?.edges || []);
    return {
        ...event,
        greenshiftScripts
    };
}

export async function getRelatedEvents(currentEventId, limit = 6) {
    const query = gql`
        query GetRelatedEvents($first: Int!) {
            events(first: $first, where: {orderby: {field: DATE, order: DESC}}) {
                nodes {
                    id
                    slug
                    title
                    translations {
                        title
                        slug
                    }
                    featuredImage {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                    eventFieldGroup {
                        eventEnddate
                        eventHall
                        eventStartdate
                        fieldGroupName
                    }
                    eventCategories(first: 10) {
                        nodes {
                            id
                            name
                        }
                    }
                    eventLocation(first: 10) {
                        nodes {
                            id
                            name
                            taxonomyEventLocation {
                                eventLocationColor
                            }
                        }
                    }
                }
            }
        }
    `;
    
    const variables = { first: 50 }; // Fetch more to account for filtering
    const data = await graphQLClient.request(query, variables);
    const events = data.events?.nodes || [];
    
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Filter events
    const filteredEvents = events.filter(event => {
        // Exclude current event
        if (event.id === currentEventId) return false;
        
        // Check if event has a start date
        if (!event.eventFieldGroup?.eventStartdate) return false;
        
        // Parse start date
        const startDate = new Date(event.eventFieldGroup.eventStartdate);
        if (isNaN(startDate.getTime())) return false;
        
        // Check if event is upcoming or currently happening
        if (event.eventFieldGroup.eventEnddate) {
            // Event has end date - show if event hasn't ended yet
            const endDate = new Date(event.eventFieldGroup.eventEnddate);
            if (isNaN(endDate.getTime())) return false;
            return today <= endDate;
        } else {
            // Event has no end date - show if event hasn't started yet
            return today <= startDate;
        }
    });
    
    // Sort by start date (ascending - earliest first)
    filteredEvents.sort((a, b) => {
        const dateA = new Date(a.eventFieldGroup.eventStartdate);
        const dateB = new Date(b.eventFieldGroup.eventStartdate);
        return dateA - dateB;
    });
    
    // Return limited number of events
    return filteredEvents.slice(0, limit);
}