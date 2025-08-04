'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { GetPageWithEventHallCarousel } from '../../lib/block';
import Skeleton from '../ui/Skeleton';
import EventHallCard from '../ui/EventHallCard';

import { usePathname } from 'next/navigation';



// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function EventHallCarouselBlock(props) {
    const [eventHallData, setEventHallData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const blockIndexRef = useRef(null);
    
    useEffect(() => {
        async function fetchEventHallData() {
            try {
                const currentPath = window.location.pathname;
                const slug = currentPath === '/' ? 'home' : currentPath.replace(/^\//, '').replace(/\/$/, '');
                
                const data = await GetPageWithEventHallCarousel(slug);
                if (data && data.eventHalls && data.eventHalls.length > 0) {
                    // Group event halls by block index
                    const blocks = {};
                    data.eventHalls.forEach(eventHall => {
                        if (!blocks[eventHall.blockIndex]) {
                            blocks[eventHall.blockIndex] = [];
                        }
                        blocks[eventHall.blockIndex].push(eventHall);
                    });
                    
                    const blockIndices = Object.keys(blocks).map(Number).sort((a, b) => a - b);
                    
                    if (blockIndexRef.current === null) {
                        // Use simple counter for block assignment
                        if (!window.eventHallBlockCount) {
                            window.eventHallBlockCount = 0;
                        }
                        blockIndexRef.current = window.eventHallBlockCount++;
                    }
                    
                    const blockIndex = blockIndices[blockIndexRef.current % blockIndices.length];
                    const blockEventHalls = blocks[blockIndex] || [];
                    
                    setEventHallData({
                        eventHalls: blockEventHalls
                    });
                } else {
                    setEventHallData(data);
                }
            } catch (error) {
                setError(error);
                console.error('Error fetching event hall data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEventHallData();
    }, []);

    if (loading) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
                <div className="gs-swiper-init">
                    <div className="">
                        <div className="">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[16px] lg:gap-[30px] min-h-[600px] px-[20px]">
                                <div className="p-4 bg-white">
                                    <Skeleton width="w-full" height="h-100" rounded="rounded-md" className="mb-3" />
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                                    <Skeleton width="w-full" height="h-4" />
                                </div>
                                <div className="p-4 bg-white hidden lg:block md:block">
                                    <Skeleton width="w-full" height="h-100" rounded="rounded-md" className="mb-3" />
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                                    <Skeleton width="w-full" height="h-4" />
                                </div>
                                <div className="p-4 bg-white hidden lg:block">
                                    <Skeleton width="w-full" height="h-100" rounded="rounded-md" className="mb-3" />
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                                    <Skeleton width="w-full" height="h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-events-message text-center opacity-50">Error loading event hall content: {error.message}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!eventHallData || !eventHallData.eventHalls || eventHallData.eventHalls.length === 0) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-events-message text-center opacity-50">No event halls found.</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel event-hall-carousel">
            <div className="gs-swiper-init">
                <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={3.2}
                    spaceBetween={30}
                    speed={400}
                    loop={false}
                    autoHeight={false}
                    grabCursor={false}
                    freeMode={false}
                    centeredSlides={false}
                    autoplay={false}
                    slidesOffsetBefore={0}
                    slidesOffsetAfter={30}
                    breakpoints={{
                        // Mobile (xs)
                        320: {
                            slidesPerView: 1.1,
                            spaceBetween: 16,
                            slidesOffsetBefore: 0,
                            slidesOffsetAfter: 0
                        },
                        // Tablet (md)
                        768: {
                            slidesPerView: 2.2,
                            spaceBetween: 16,
                        },
                        // Desktop
                        1024: {
                            slidesPerView: 3.2,
                            spaceBetween: 30,
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
                    className="swiper event-hall-swiper"
                    wrapperClass="swiper-wrapper event-hall-wrapper"
                >
                    {eventHallData.eventHalls.map((eventHall, index) => (
                        <SwiperSlide key={index}>
                            <EventHallCard eventHall={eventHall} />
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
        </div>
    );
}
