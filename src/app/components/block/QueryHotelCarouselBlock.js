'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import HotelCard from '../ui/HotelCard';
import Skeleton from '../ui/Skeleton';
import { GetHotels } from '../../lib/block';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function QueryHotelCarouselBlock(props) {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchHotels() {
            try {
                const hotelData = await GetHotels(8);
                setHotels(hotelData);
            } catch (error) {
                setError(error);
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHotels();
    }, []);

    if (loading) {
        return (
            <div {...props} className="h-full">
                <div className="grid lg:grid-cols-2 grid-cols-1 lg:px-0 px-[20px] gap-[30px] h-full">
                    <div className="p-4 bg-white h-full">
                        <Skeleton width="w-full" height="h-48" rounded="rounded-md" className="mb-3" />
                        <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                        <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <div className="flex gap-[15px]">
                            <Skeleton width="w-full" height="h-4" className="mb-2" />
                            <Skeleton width="w-full" height="h-4" className="mb-2" />
                        </div>
                    </div>

                    <div className="p-4 bg-white h-full hidden lg:block">
                        <Skeleton width="w-full" height="h-48" rounded="rounded-md" className="mb-3" />
                        <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                        <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <Skeleton width="w-full" height="h-4" className="mb-2" />
                        <div className="flex gap-[15px]">
                            <Skeleton width="w-full" height="h-4" className="mb-2" />
                            <Skeleton width="w-full" height="h-4" className="mb-2" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-hotel-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="error-message text-center text-red-600 py-8">
                                Error loading hotel content.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (hotels.length === 0) {
        return (
            <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-hotel-carousel">
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-hotels-message text-center opacity-50 py-8">
                                No hotels found.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-hotel-carousel">
            <div className="gs-swiper-init">
                <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={1.9}
                    spaceBetween={30}
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
                            slidesOffsetBefore: 20,
                            slidesOffsetAfter: 20,
                            slidesPerView: 1.2,
                            spaceBetween: 16,
                        },
                        // Tablet (md)
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 16,
                            slidesOffsetBefore: 20,
                            slidesOffsetAfter: 20,
                        },
                        // Desktop
                        1024: {
                            slidesPerView: 1.9,
                            spaceBetween: 30,
                            slidesOffsetAfter: 35,
                        },
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    className="swiper"
                >
                    {hotels.map((hotel) => (
                        <SwiperSlide key={hotel.id}>
                            <HotelCard hotel={hotel} />
                        </SwiperSlide>
                    ))}
            
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
