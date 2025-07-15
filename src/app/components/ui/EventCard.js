'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EventCard({ event }) {
    const pathname = usePathname();
    
    // Simple language detection from URL path
    const getCurrentLanguage = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        
        if (pathSegments.length > 0) {
            const firstSegment = pathSegments[0];
            if (['th', 'en'].includes(firstSegment)) {
                return firstSegment;
            }
        }
        return 'en'; // default to English
    };
    
    const currentLang = getCurrentLanguage();

    // Helper function to check if event is happening now
    const isHappeningNow = () => {
        if (!event.eventFieldGroup?.eventStartdate) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        const startDate = new Date(event.eventFieldGroup.eventStartdate);
        startDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        if (event.eventFieldGroup.eventEnddate) {
            const endDate = new Date(event.eventFieldGroup.eventEnddate);
            endDate.setHours(23, 59, 59, 999); // Set to end of day for comparison
            // Event is happening now if today is between start and end date (inclusive)
            return today >= startDate && today <= endDate;
        } else {
            // Event has no end date - happening now if today equals start date
            return today.getTime() === startDate.getTime();
        }
    };

    // Helper function to format event date
    const formatEventDate = () => {
        if (!event.eventFieldGroup?.eventStartdate) return '';
        
        const startDate = new Date(event.eventFieldGroup.eventStartdate);
        const startDay = startDate.getDate();
        const startMonth = startDate.toLocaleDateString('en-US', { month: 'long' });
        const startYear = startDate.getFullYear();
        
        if (event.eventFieldGroup.eventEnddate) {
            const endDate = new Date(event.eventFieldGroup.eventEnddate);
            const endDay = endDate.getDate();
            const endMonth = endDate.toLocaleDateString('en-US', { month: 'long' });
            const endYear = endDate.getFullYear();
            
            // Same month & year → 22 – 30 March 2025
            if (startMonth === endMonth && startYear === endYear) {
                return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
            }
            // Same year, different month → 28 Feb – 2 Mar 2025
            else if (startYear === endYear) {
                return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
            }
            // Different years → 28 Dec 2024 – 2 Jan 2025
            else {
                return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
            }
        } else {
            // Only start date available → 22 March 2025
            return `${startDay} ${startMonth} ${startYear}`;
        }
    };

    return (
        <article className="content-item -card">
            <div className="pic">
                
                <Link
                    href={
                        currentLang === 'th'
                            ? `/th/event/${event.translations && event.translations[0]?.slug ? event.translations[0].slug : event.slug}`
                            : `/event/${event.slug}`
                    }
                    title={`Permalink to ${currentLang === 'th'
                        ? (event.translations && event.translations[0]?.title ? event.translations[0].title : event.title)
                        : event.title
                    }`}
                >
                    <Image
                        src={event.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                        alt={event.featuredImage?.node?.altText || event.title}
                        width={400}
                        height={225}
                        className="w-full h-auto"
                    />
                </Link>
            </div>
            <div className="info">
                <div className="entry-meta">
                    {isHappeningNow() && (
                        <div className="happening-now-label">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="9" cy="9" r="9" fill="#FAE7EA"/>
                                <circle cx="9" cy="9" r="6" fill="#E8909E"/>
                                <circle cx="9" cy="9" r="3" fill="#CE0E2D"/>
                            </svg>
                            Happening Now
                        </div>
                    )}
                    {event.eventCategories?.nodes?.length > 0 && (
                        <div className="event-categories">
                            {event.eventCategories.nodes.map((cat) => (
                                <div key={cat.id} className="event-category">
                                    {cat.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <header className="entry-header">
                    <h2 className="entry-title">

                        <Link
                            href={
                                currentLang === 'th'
                                    ? `/th/event/${event.translations && event.translations[0]?.slug ? event.translations[0].slug : event.slug}`
                                    : `/event/${event.slug}`
                            }
                        >
                            {currentLang === 'th'
                                ? (event.translations && event.translations[0]?.title ? event.translations[0].title : event.title)
                                : event.title
                            }
                        </Link>
                    </h2>
                </header>
                <div className="entry-date">
                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.25 8.58325H4.41667V10.4166H6.25V8.58325ZM9.91667 8.58325H8.08333V10.4166H9.91667V8.58325ZM13.5833 8.58325H11.75V10.4166H13.5833V8.58325ZM15.4167 2.16659H14.5V0.333252H12.6667V2.16659H5.33333V0.333252H3.5V2.16659H2.58333C1.56583 2.16659 0.759167 2.99159 0.759167 3.99992L0.75 16.8333C0.75 17.8416 1.56583 18.6666 2.58333 18.6666H15.4167C16.425 18.6666 17.25 17.8416 17.25 16.8333V3.99992C17.25 2.99159 16.425 2.16659 15.4167 2.16659ZM15.4167 16.8333H2.58333V6.74992H15.4167V16.8333Z" fill="#CE0E2D"/>
                    </svg>
                    <div className="event-date">{formatEventDate()}</div>
                </div>
                <div className="entry-location">
                    {event.eventLocation?.nodes?.length > 0 && (
                        <div className="event-locations">
                            {event.eventLocation.nodes.map((location) => (
                                <div key={location.id} className="event-location" style={{backgroundColor: location.taxonomyEventLocation.eventLocationColor || '#CE0E2D'}}>
                                    {location.name}
                                </div>
                            ))}
                        </div>
                    )}
                    {event.eventFieldGroup?.eventHall && (
                        <div className="event-hall" style={{color: event.eventLocation?.nodes?.[0]?.taxonomyEventLocation?.eventLocationColor || '#CE0E2D'}}>
                            {event.eventFieldGroup.eventHall}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
} 