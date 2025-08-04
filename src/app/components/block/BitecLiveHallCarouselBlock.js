'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { GetPageWithBitecLiveHallCarousel } from '../../lib/block';
import Skeleton from '../ui/Skeleton';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function BitecLiveHallCarouselBlock(props) {
    const [bitecLiveHallData, setBitecLiveHallData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchBitecLiveHallData() {
            try {
                const data = await GetPageWithBitecLiveHallCarousel('plan-and-event/exhibition');
                setBitecLiveHallData(data);
            } catch (error) {
                setError(error);
                console.error('Error fetching BitecLive hall data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBitecLiveHallData();
    }, []);

    if (loading) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-bitec-live-hall-carousel">
                <div className="gs-swiper-init">
                    <div className="bitec-live-hall-card bg-white overflow-hidden mb-8">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left side - Image Skeleton (70% width on desktop) */}
                            <div className="w-full lg:w-[70%] relative">
                                <div className="relative h-[375px] md:h-[400px] lg:h-[550px] bg-gray-200">
                                    <Skeleton width="w-full" height="h-full" rounded="rounded-none" />
                                </div>
                            </div>
                            
                            {/* Right side - Content Skeleton (30% width on desktop) */}
                            <div className="w-full lg:w-[30%] bg-white px-[15px] py-[40px] lg:px-[50px] flex flex-col justify-center">
                                <div className="space-y-4">
                                    {/* Title skeleton */}
                                    <Skeleton width="w-3/4" height="h-8" className="mb-4" />
                                    
                                    {/* Size skeleton */}
                                    <div className="flex gap-[10px] items-center mb-0">
                                        <Skeleton width="w-1/2" height="h-6" />
                                    </div>
                                    
                                    {/* Capacity skeleton */}
                                    <div className="flex gap-[10px] mt-2 items-center mb-0">
                                        <Skeleton width="w-1/3" height="h-6" />
                                    </div>
                                    
                                    {/* Button skeleton */}
                                    <div className="pt-2 mt-4">
                                        <Skeleton width="w-full lg:w-auto" height="h-10" rounded="rounded-none" />
                                    </div>
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
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-bitec-live-hall-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-halls-message text-center opacity-50">Error loading BitecLive hall content: {error.message}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!bitecLiveHallData || !bitecLiveHallData.bitecLiveHalls || bitecLiveHallData.bitecLiveHalls.length === 0) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-bitec-live-hall-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-halls-message text-center opacity-50">No BitecLive halls found.</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-bitec-live-hall-carousel" >
            <div className="gs-swiper-init">
                {bitecLiveHallData.bitecLiveHalls.map((bitecLiveHall, index) => (
                    <div key={index} className="bitec-live-hall-card bg-white overflow-hidden  mb-8">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left side - Image Swiper (70% width on desktop) */}
                            <div className="w-full lg:w-[70%] relative">
                                {bitecLiveHall.gallery && bitecLiveHall.gallery.length > 0 && (
                                    <Swiper
                                        modules={[Navigation, Pagination]}
                                        slidesPerView={1}
                                        spaceBetween={0}
                                        speed={400}
                                        loop={bitecLiveHall.gallery.length > 1}
                                        autoHeight={false}
                                        grabCursor={true}
                                        freeMode={false}
                                        centeredSlides={false}
                                        autoplay={bitecLiveHall.gallery.length > 1 ? {
                                            delay: 5000,
                                            disableOnInteraction: false,
                                        } : false}
                                        pagination={{
                                            el: '.swiper-pagination',
                                            clickable: true,
                                        }}
                                        navigation={{
                                            nextEl: '.swiper-button-next',
                                            prevEl: '.swiper-button-prev',
                                        }}
                                        className="swiper bitec-live-hall-image-swiper h-full"
                                        wrapperClass="swiper-wrapper"
                                    >
                                        {bitecLiveHall.gallery.map((image, imageIndex) => (
                                            <SwiperSlide key={imageIndex}>
                                                <div className="relative h-[375px] md:h-[400px] lg:h-[550px]">
                                                    <img 
                                                        src={image.url} 
                                                        alt={image.alt || 'BitecLive Hall'} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {image.caption && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 text-sm">
                                                            {image.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                        <div className="swiper-pagination"></div>
                                    </Swiper>
                                )}
                                <div className="swiper-button-prev _mobile">
                                    <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.6666 6.66671H3.52492L8.18325 2.00837L6.99992 0.833374L0.333252 7.50004L6.99992 14.1667L8.17492 12.9917L3.52492 8.33337H13.6666V6.66671Z"/>
                                    </svg>
                                </div>
                                <div className="swiper-button-next _mobile">
                                    <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.99992 0.833374L5.82492 2.00837L10.4749 6.66671H0.333252V8.33337H10.4749L5.82492 12.9917L6.99992 14.1667L13.6666 7.50004L6.99992 0.833374Z"/>
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Right side - Content (30% width on desktop) */}
                            <div className="w-full lg:w-[30%] bg-white px-[15px] py-[40px] lg:px-[50px] flex flex-col justify-center">
                                <div className="space-y-4">
                                    {bitecLiveHall.title && (
                                        <h3 className="text-[#3D3D3F] text-[30px] font-[500] mb-0">
                                            {bitecLiveHall.title}
                                        </h3>
                                    )}

                                    {bitecLiveHall.size && (
                                        <div className="flex gap-[10px] items-center mb-0">
                                            <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.3911 11.94C12.2869 11.94 12.183 11.9174 12.0865 11.8725L1.28653 6.83254C1.03309 6.71446 0.871094 6.45982 0.871094 6.17998C0.871094 5.90014 1.03309 5.6455 1.28653 5.52742L12.0865 0.487422C12.2793 0.397422 12.5027 0.397422 12.6954 0.487422L23.4954 5.52742C23.7491 5.6455 23.9111 5.90014 23.9111 6.17998C23.9111 6.45982 23.7491 6.71446 23.4957 6.83254L12.6957 11.8725C12.5992 11.9174 12.4953 11.94 12.3911 11.94ZM3.29365 6.17998L12.3911 10.4253L21.4885 6.17998L12.3911 1.93462L3.29365 6.17998ZM12.6957 16.1925L23.4957 11.1525C23.8559 10.9845 24.0117 10.5557 23.8437 10.1957C23.6752 9.83566 23.2468 9.67966 22.8868 9.84766L12.3911 14.7453L1.89565 9.84742C1.53493 9.67942 1.10701 9.83542 0.938774 10.1954C0.770774 10.5554 0.926534 10.9843 1.28677 11.1523L12.0868 16.1923C12.183 16.2374 12.2869 16.26 12.3911 16.26C12.4953 16.26 12.5992 16.2374 12.6957 16.1925ZM12.6957 20.5125L23.4957 15.4725C23.8559 15.3045 24.0117 14.8757 23.8437 14.5157C23.6752 14.1564 23.2468 14.0004 22.8868 14.1677L12.3911 19.0653L1.89565 14.1674C1.53493 14.0001 1.10701 14.1561 0.938774 14.5154C0.770774 14.8754 0.926534 15.3043 1.28677 15.4723L12.0868 20.5123C12.183 20.5574 12.2869 20.58 12.3911 20.58C12.4953 20.58 12.5992 20.5574 12.6957 20.5125Z" fill="#636363"/>
                                            </svg>
                                            <p className="text-[#636363] text-[25px]">
                                                {bitecLiveHall.size}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {bitecLiveHall.capacity && (
                                        <div className="flex gap-[10px] items-center mb-0">
                                            <svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M16.0605 9.62988C17.4305 10.5599 18.3905 11.8199 18.3905 13.4999V16.4999H22.3905V13.4999C22.3905 11.3199 18.8205 10.0299 16.0605 9.62988Z" fill="#636363"/>
                                                <path d="M8.39062 8.5C10.5998 8.5 12.3906 6.70914 12.3906 4.5C12.3906 2.29086 10.5998 0.5 8.39062 0.5C6.18149 0.5 4.39062 2.29086 4.39062 4.5C4.39062 6.70914 6.18149 8.5 8.39062 8.5Z" fill="#636363"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M14.3905 8.5C16.6005 8.5 18.3905 6.71 18.3905 4.5C18.3905 2.29 16.6005 0.5 14.3905 0.5C13.9205 0.5 13.4805 0.6 13.0605 0.74C13.8905 1.77 14.3905 3.08 14.3905 4.5C14.3905 5.92 13.8905 7.23 13.0605 8.26C13.4805 8.4 13.9205 8.5 14.3905 8.5Z" fill="#636363"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.39062 9.5C5.72062 9.5 0.390625 10.84 0.390625 13.5V16.5H16.3906V13.5C16.3906 10.84 11.0606 9.5 8.39062 9.5Z" fill="#636363"/>
                                            </svg>

                                            <p className="text-[#636363] text-[25px]">
                                                {bitecLiveHall.capacity}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {bitecLiveHall.link && (
                                        <div className="pt-2">
                                            <a 
                                                href={bitecLiveHall.link} 
                                                className="inline-flex gap-[10px] items-center justify-center bg-[#CE0E2D] text-white px-[30px] py-[5px] text-[22px] font-normal hover:bg-[var(--s-accent-hover)] transition-colors duration-200 text-center mt-3 w-full lg:w-auto"
                                            >
                                                {bitecLiveHall.linkTitle}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
