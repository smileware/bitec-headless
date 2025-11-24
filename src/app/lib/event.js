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

export async function getRecentEvents(limit = 9) {
    const query = gql`
        query GetRecentEvents($first: Int!) {
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
    
    const variables = { first: limit * 2 }; // Fetch more to account for filtering
    const data = await graphQLClient.request(query, variables);
    const events = data.events?.nodes || [];
    
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Filter events to show only upcoming/current events
    const filteredEvents = events.filter(event => {
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

export async function getRecentBitecLiveEvents(locationId = 'Bitec Live', limit = 9) {
    const query = gql`
        query GetRecentEventsByLocation($first: Int!) {
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
    
    const variables = { first: limit * 2 };
    const data = await graphQLClient.request(query, variables);
    const events = data.events?.nodes || [];
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Filter events to show only upcoming/current events that match "bitec live" in categories OR location
    const filteredEvents = events.filter(event => {
        // Check if event has a start date
        if (!event.eventFieldGroup?.eventStartdate) return false;
        // Parse start date
        const startDate = new Date(event.eventFieldGroup.eventStartdate);
        if (isNaN(startDate.getTime())) return false;
        // Check if event is upcoming or currently happening
        let isUpcoming = false;
        if (event.eventFieldGroup.eventEnddate) {
            const endDate = new Date(event.eventFieldGroup.eventEnddate);
            if (isNaN(endDate.getTime())) return false;
            isUpcoming = today <= endDate;
        } else {
            isUpcoming = today <= startDate;
        }
        
        // Check if event category includes "bitec live" (case insensitive)
        const hasCategory = event.eventCategories?.nodes?.some(cat => {
            return cat.name?.toLowerCase().includes('bitec live');
        });
        
        // Check if event location includes "bitec live" (case insensitive)
        const hasLocation = event.eventLocation?.nodes?.some(loc => {
            return loc.name?.toLowerCase().includes('bitec live');
        });
        
        // Return true if upcoming AND (has category OR has location)
        return isUpcoming && (hasCategory || hasLocation);
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

export async function getAllEventCategories() {
    const query = gql`
        query GetAllEventCategories {
            eventCategories(first: 100) {
                nodes {
                    id
                    name
                    slug
                    count
                }
            }
        }
    `;
    
    try {
        const data = await graphQLClient.request(query);
        const categories = data.eventCategories?.nodes || [];
        // Filter to only show categories that have at least 1 event
        const categoriesWithPosts = categories.filter(category => category.count > 0);
        return categoriesWithPosts;

    } catch (error) {
        console.error('Error fetching event categories:', error);
        return [];
    }
}

export async function getFilteredEvents(filters = {}) {
    const {
        categoryId = null,
        eventType = 'upcoming', // 'upcoming' or 'past'
        month = null,
        year = null,
        page = 1,
        perPage = 12
    } = filters;
    
    const query = gql`
        query GetFilteredEvents($first: Int!) {
            events(
                first: $first
                where: { 
                    orderby: { field: DATE, order: DESC }
                }
            ) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
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
    
    // Fetch a large number of events to ensure we get all relevant ones
    const variables = { 
        first: 1000 // Fetch more events to ensure we don't miss any
    };
    
    const data = await graphQLClient.request(query, variables);
    const events = data.events?.nodes || [];
    
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Filter events based on criteria
    let filteredEvents = events.filter(event => {
        // Check if event has a start date
        if (!event.eventFieldGroup?.eventStartdate) {
            return false;
        }
        
        // Parse start date
        const startDate = new Date(event.eventFieldGroup.eventStartdate);
        if (isNaN(startDate.getTime())) {
            return false;
        }
        
        // Filter by event type (upcoming/past)
        if (eventType === 'upcoming') {
            // Show upcoming and current events
            if (event.eventFieldGroup.eventEnddate) {
                const endDate = new Date(event.eventFieldGroup.eventEnddate);
                if (isNaN(endDate.getTime())) return false;
                return today <= endDate;
            } else {
                return today <= startDate;
            }
        } else if (eventType === 'past') {
            // Show past events
            if (event.eventFieldGroup.eventEnddate) {
                const endDate = new Date(event.eventFieldGroup.eventEnddate);
                if (isNaN(endDate.getTime())) return false;
                return today > endDate;
            } else {
                return today > startDate;
            }
        }
        
        return true;
    });
    
    // Filter by category if specified
    if (categoryId) {
        filteredEvents = filteredEvents.filter(event => {
            return event.eventCategories?.nodes?.some(cat => cat.id === categoryId);
        });
    }
    
    // Filter by month and year if specified
    if (month !== null || year !== null) {
        filteredEvents = filteredEvents.filter(event => {
            const startDate = new Date(event.eventFieldGroup.eventStartdate);
            const startMonth = startDate.getMonth() + 1; // getMonth() returns 0-11
            const startYear = startDate.getFullYear();
            
            // Check if event has an end date
            if (event.eventFieldGroup.eventEnddate) {
                const endDate = new Date(event.eventFieldGroup.eventEnddate);
                const endMonth = endDate.getMonth() + 1;
                const endYear = endDate.getFullYear();
                
                // For month filtering: check if the event spans across the selected month
                if (month !== null) {
                    const monthMatches = (
                        (startYear === endYear && startMonth <= month && endMonth >= month) ||
                        (startYear < endYear && startMonth <= month) ||
                        (startYear < endYear && endMonth >= month) ||
                        (startYear === endYear && startMonth === month) ||
                        (startYear === endYear && endMonth === month)
                    );
                    if (!monthMatches) return false;
                }
                
                // For year filtering: check if the event spans across the selected year
                if (year !== null) {
                    const yearMatches = startYear <= year && endYear >= year;
                    if (!yearMatches) return false;
                }
            } else {
                // Event has no end date, only check start date
                if (month !== null && startMonth !== month) return false;
                if (year !== null && startYear !== year) return false;
            }
            
            return true;
        });
    }
    
    // Sort by start date (ascending for upcoming, descending for past)
    filteredEvents.sort((a, b) => {
        const dateA = new Date(a.eventFieldGroup.eventStartdate);
        const dateB = new Date(b.eventFieldGroup.eventStartdate);
        return eventType === 'upcoming' ? dateA - dateB : dateB - dateA;
    });
    
    // Calculate total before pagination
    const total = filteredEvents.length;
    
    // Apply pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    return {
        events: paginatedEvents,
        hasMore: endIndex < total,
        total: total
    };
}

export async function getAllEventYears() {
    const query = gql`
        query GetAllEventYears {
            events(first: 1000, where: {orderby: {field: DATE, order: DESC}}) {
                nodes {
                    eventFieldGroup {
                        eventStartdate
                        eventEnddate
                    }
                }
            }
        }
    `;
    
    const data = await graphQLClient.request(query);
    const events = data.events?.nodes || [];
    
    // Extract unique years from both start and end dates
    const years = new Set();
    events.forEach(event => {
        if (event.eventFieldGroup?.eventStartdate) {
            const startYear = new Date(event.eventFieldGroup.eventStartdate).getFullYear();
            years.add(startYear);
        }
        if (event.eventFieldGroup?.eventEnddate) {
            const endYear = new Date(event.eventFieldGroup.eventEnddate).getFullYear();
            years.add(endYear);
        }
    });
    
    // Convert to array and sort in descending order (newest first)
    return Array.from(years).sort((a, b) => b - a);
}



