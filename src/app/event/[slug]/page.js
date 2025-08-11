import { getEventBySlug, getRelatedEvents } from "../../lib/event";
import ScriptLoader from '../../components/ScriptLoader';
import Image from 'next/image';
import ShareButtons from "../../components/ShareButtons";
import EventCard from "../../components/ui/EventCard";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};

  const title = event.title || 'Event';
  const description = ((event.content || '')
    .replace(/<[^>]*>/g, '')
    .trim() || '').slice(0, 160);
  const image = event.featuredImage?.node?.sourceUrl;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function EventPage({ params }) {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    const currentLang = 'en';
    // Get related events (only if we have a current event)
    const relatedEvents = event ? await getRelatedEvents(event.id, 3) : [];

    if (!event) {
        return (
            <div>
                <h1>Event not found</h1>
                <p>Could not find event: {slug}</p>
            </div>
        );
    }

    return (
        <div>
            {event.greenshiftInlineCss && (
                <style dangerouslySetInnerHTML={{ __html: event.greenshiftInlineCss }} />
            )}
            <article>
                <header className="bg-[#161616] lg:py-[100px] lg:py-[40px] py-[20px]">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 max-w-[1380px] mx-auto px-[20px]">
                        <div className="lg:pr-[60px] order-2 lg:order-1">
                            <div className="h-full flex flex-col lg:justify-between lg:gap-4 text-white text-[20px] pb-5 lg:pb-0">
                                <div className="">
                                    {event.eventCategories?.nodes?.map((cat) => (
                                        <span key={cat.id} className="inline-flex items-center bg-[#CE0E2D] text-white lg:text-[18px] text-[22px] rounded-full px-[20px] py-[2px]">
                                            {cat.name}
                                        </span>
                                    ))}
                                    
                                    <h1 className="lg:text-[51px] text-[39px] !leading-[1.1] font-[500] text-white mt-[20px]">{event.title}</h1>
                                    {/* Date */}
                                    {event.eventFieldGroup?.eventStartdate && (
                                        <span className="flex gap-[10px] items-center lg:mt-[40px] mt-[20px] text-[22px] mb-[10px]">
                                            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.25 9.08334H4.41667V10.9167H6.25V9.08334ZM9.91667 9.08334H8.08333V10.9167H9.91667V9.08334ZM13.5833 9.08334H11.75V10.9167H13.5833V9.08334ZM15.4167 2.66668H14.5V0.833344H12.6667V2.66668H5.33333V0.833344H3.5V2.66668H2.58333C1.56583 2.66668 0.759167 3.49168 0.759167 4.50001L0.75 17.3333C0.75 18.3417 1.56583 19.1667 2.58333 19.1667H15.4167C16.425 19.1667 17.25 18.3417 17.25 17.3333V4.50001C17.25 3.49168 16.425 2.66668 15.4167 2.66668ZM15.4167 17.3333H2.58333V7.25001H15.4167V17.3333Z" fill="white"/>
                                            </svg>

                                            {(() => {
                                                // Helper: English and Thai month names
                                                const monthNames = {
                                                    en: {
                                                        January: "January",
                                                        February: "February",
                                                        March: "March",
                                                        April: "April",
                                                        May: "May",
                                                        June: "June",
                                                        July: "July",
                                                        August: "August",
                                                        September: "September",
                                                        October: "October",
                                                        November: "November",
                                                        December: "December"
                                                    },
                                                    th: {
                                                        January: "มกราคม",
                                                        February: "กุมภาพันธ์",
                                                        March: "มีนาคม",
                                                        April: "เมษายน",
                                                        May: "พฤษภาคม",
                                                        June: "มิถุนายน",
                                                        July: "กรกฎาคม",
                                                        August: "สิงหาคม",
                                                        September: "กันยายน",
                                                        October: "ตุลาคม",
                                                        November: "พฤศจิกายน",
                                                        December: "ธันวาคม"
                                                    }
                                                };

                                                // Use server-side detected language
                                                const lang = currentLang;

                                                const { eventStartdate, eventEnddate } = event.eventFieldGroup || {};
                                                if (!eventStartdate) return null;

                                                // Defensive date parsing - handles ISO format and other common formats
                                                function parseDate(str) {
                                                    if (!str) return null;
                                                    
                                                    // Try to parse as ISO format first (handles WordPress format like 2025-07-01T00:00:00+00:00)
                                                    const isoDate = new Date(str);
                                                    if (!isNaN(isoDate.getTime())) {
                                                        return isoDate;
                                                    }
                                                    
                                                    // Fallback: try to parse as "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
                                                    const [date, time] = str.trim().split(" ");
                                                    if (!date) return null;
                                                    const dateParts = date.split("-");
                                                    if (dateParts.length !== 3) return null;
                                                    const [year, month, day] = dateParts.map(Number);
                                                    if (
                                                        isNaN(year) ||
                                                        isNaN(month) ||
                                                        isNaN(day)
                                                    ) return null;
                                                    let hour = 0, min = 0, sec = 0;
                                                    if (time) {
                                                        const timeParts = time.split(":").map(Number);
                                                        if (timeParts.length >= 1 && !isNaN(timeParts[0])) hour = timeParts[0];
                                                        if (timeParts.length >= 2 && !isNaN(timeParts[1])) min = timeParts[1];
                                                        if (timeParts.length >= 3 && !isNaN(timeParts[2])) sec = timeParts[2];
                                                    }
                                                    const d = new Date(year, month - 1, day, hour, min, sec);
                                                    // Check for invalid date
                                                    if (isNaN(d.getTime())) return null;
                                                    return d;
                                                }

                                                const startDate = parseDate(eventStartdate);
                                                if (!startDate) {
                                                    return null;
                                                }
                                                const startDay = startDate.getDate();
                                                const startMonth = startDate.toLocaleString("en-US", { month: "long" });
                                                const startYear = startDate.getFullYear();
                                                const displayStartMonth = monthNames[lang][startMonth] || startMonth;

                                                if (eventEnddate) {
                                                    const endDate = parseDate(eventEnddate);
                                                    if (!endDate) {
                                                        // If end date is invalid, just show start date
                                                        return (
                                                            <div>
                                                                {startDay} {displayStartMonth} {startYear}
                                                            </div>
                                                        );
                                                    }
                                                    const endDay = endDate.getDate();
                                                    const endMonth = endDate.toLocaleString("en-US", { month: "long" });
                                                    const endYear = endDate.getFullYear();
                                                    const displayEndMonth = monthNames[lang][endMonth] || endMonth;

                                                    // Same month & year
                                                    if (startMonth === endMonth && startYear === endYear) {
                                                        // 22 – 30 March 2025
                                                        return (
                                                            <div>
                                                                {startDay} – {endDay} {displayStartMonth} {startYear}
                                                            </div>
                                                        );
                                                    }
                                                    // Same year, different month
                                                    else if (startYear === endYear) {
                                                        // 28 Feb – 2 Mar 2025
                                                        return (
                                                            <div>
                                                                {startDay} {displayStartMonth} – {endDay} {displayEndMonth} {startYear}
                                                            </div>
                                                        );
                                                    }
                                                    // Different years
                                                    else {
                                                        // 28 Dec 2024 – 2 Jan 2025
                                                        return (
                                                            <div>
                                                                {startDay} {displayStartMonth} {startYear} – {endDay} {displayEndMonth} {endYear}
                                                            </div>
                                                        );
                                                    }
                                                } else {
                                                    // Only start date available → 22 March 2025
                                                    return (
                                                        <div>
                                                            {startDay} {displayStartMonth} {startYear}
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </span>
                                    )}
                                    {/* Location */}
                                    <div className="flex gap-[10px] items-center text-[22px] mb-[10px] ">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                        </svg>

                                        {event.eventLocation?.nodes?.map((cat) => (
                                            <span key={cat.id} className="text-white">
                                                {cat.name}
                                            </span>
                                        ))}

                                        {event.eventFieldGroup?.eventHall && (
                                            <span className="text-white">
                                                {event.eventFieldGroup.eventHall}
                                            </span>
                                        )}
                                    </div>
                                    {/* Time */}
                                    {event.eventFieldGroup?.eventStartdate && (
                                        <span className="flex gap-[10px] items-center text-[22px] mb-[15px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                                            </svg>

                                            {(() => {
                                                const startDateTime = event.eventFieldGroup.eventStartdate;
                                                const endDateTime = event.eventFieldGroup.eventEnddate;

                                                const startTime = (() => {
                                                    if (!startDateTime) return null;
                                                    const date = new Date(startDateTime);
                                                    if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) return null;
                                                    return date.toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit',
                                                        timeZone: 'UTC'
                                                    });
                                                })();

                                                const endTime = (() => {
                                                    if (!endDateTime) return null;
                                                    const date = new Date(endDateTime);
                                                    if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) return null;
                                                    // Use UTC time to avoid timezone conversion
                                                    return date.toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit',
                                                        timeZone: 'UTC'
                                                    });
                                                })();

                                                if (startTime && endTime) {
                                                    return (
                                                        <div>
                                                            {startTime} – {endTime}
                                                        </div>
                                                    );
                                                } else if (startTime) {
                                                    return (
                                                        <div>
                                                            {startTime}
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div>
                                                            -
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col lg:flex-row justify-between">
                                    <ShareButtons title={event.title} color="#B5B5B8" />
                                    <Image
                                        src="/img/award-badge.png"
                                        alt="Award Badge"
                                        width={120}
                                        height={70}
                                        className="lg:ml-4 lg:mt:0 mt-4 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="lg:pl-[60px] order-1 lg:order-2">
                            <div className="aspect-square  relative">
                                <Image
                                    src={event.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                                    alt={event.featuredImage?.node?.altText || "Event thumbnail"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative">
                    <svg className="absolute top-0 right-0 lg:w-[97px] lg:h-[97px] w-[62px] h-[62px]" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="97" y="62" width="62" height="62" transform="rotate(180 97 62)" fill="#BB0D29"/>
                        <rect x="35" y="97" width="35" height="35" transform="rotate(180 35 97)" fill="#BB0D29"/>
                    </svg>
                    <div className="max-w-[1380px] mx-auto lg:py-[100px] py-[40px] px-[20px]">
                        <div dangerouslySetInnerHTML={{ __html: event.content }} />
                    </div>
                </div>
                
                <div className="bg-[#F4F4F4] lg:py-[100px] py-[40px]">
                    <div className="max-w-[1380px] mx-auto px-[20px]">
                        <h2 className="lg:text-[51px] text-[39px] font-[500] text-[#161616] lg:mb-[30px] mb-[20px]">
                            More Events
                        </h2>
                        <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-[30px] gap-[16px]">
                        {/* add event card here */}
                        {relatedEvents.map((relatedEvent) => (
                            <EventCard key={relatedEvent.id} event={relatedEvent} />
                        ))}
                        {relatedEvents.length === 0 && (
                            <p className="text-gray-500 text-center col-span-3">No upcoming events found.</p>
                        )}
                        </div>
                    </div>
                </div>
            </article>
            

            <ScriptLoader scripts={event.greenshiftScripts} />
{/*             
            {event.greenshiftScripts?.map((src, index) => (
                <Script key={index} src={src} strategy="afterInteractive" />
            ))} */}
        </div>
    );
}
