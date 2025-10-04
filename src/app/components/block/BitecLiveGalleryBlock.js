'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Skeleton from '../ui/Skeleton';
import { GetPageWithBitecLiveGallery } from '../../lib/block';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function BitecLiveGalleryBlock(props) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEvents() {
            try {

                const path = window.location.pathname.replace(/^\/|\/$/g, "");
                const parts = path.split("/").filter(Boolean);
                const hasLangPrefix = parts[0] === "th";
                const isTH = hasLangPrefix;
                const slug = hasLangPrefix ? (parts.slice(1).join("/") || "home") : (path || "home");
                const recentEvents = await GetPageWithBitecLiveGallery(slug, isTH);
                // const recentEvents = await GetPageWithBitecLiveGallery('bitec-live');

                setEvents(recentEvents);
            } catch (error) {
                setError(error);
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div {...props} className={`wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel ${props.className || ''}`}>
                <div className="gs-swiper-init">
                    <div className="">
                        <div className="">
                            <div className="grid gap-4">
                                <div className="p-4">
                                    <Skeleton width="w-full" height="h-[550px]" rounded="rounded-md" className="mb-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div {...props} className={`swiper-bitec-gallery ${props.className || ''}`}>Error loading gallery.</div>;
    }

    return (
        <div {...props} className={`swiper-bitec-gallery ${props.className || ''}`}>
            <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={1}
                    spaceBetween={20}
                    speed={400}
                    loop={false}
                    autoHeight={false}
                    grabCursor={false}
                    freeMode={false}
                    centeredSlides={false}
                    autoplay={false}
                    breakpoints={{
                        // Mobile (xs)
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        // Tablet (md)
                        768: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        // Desktop
                        1024: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                        el: '.swiper-pagination',
                        clickable: true,
                    }}
                    className="swiper"
                >
                    {events.map((event) => (
                        <SwiperSlide key={event.url}>
                            <Image src={event.url} alt={event.alt || 'Gallery image'} width={1380} height={800} className="w-full lg:h-[550px] h-[400px] object-cover" />
                        </SwiperSlide>
                    ))}
                    <div className="swiper-pagination"></div>
                </Swiper>
                
                <div className="swiper-button-prev">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.6666 6.66671H3.52492L8.18325 2.00837L6.99992 0.833374L0.333252 7.50004L6.99992 14.1667L8.17492 12.9917L3.52492 8.33337H13.6666V6.66671Z"/>
                    </svg>
                </div>
                <div className="swiper-button-next">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99992 0.833374L5.82492 2.00837L10.4749 6.66671H0.333252V8.33337H10.4749L5.82492 12.9917L6.99992 14.1667L13.6666 7.50004L6.99992 0.833374Z"/>
                    </svg>
                </div>
        </div>
    );
}