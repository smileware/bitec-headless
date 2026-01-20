'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { GetRecommendedHotels } from '@/app/lib/block';
import Skeleton from '@/app/components/ui/Skeleton';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function RecommendedHotelCarouselBlock(props) {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(1);

    useEffect(() => {
        const fetchRecommendedHotels = async () => {
            try {
                setLoading(true);

                const path = window.location.pathname.replace(/^\/|\/$/g, "");
                const parts = path.split("/").filter(Boolean);
                const hasLangPrefix = parts[0] === "th";
                const isTH = hasLangPrefix;
                const recommendedHotels = await GetRecommendedHotels(8, isTH);

                // const recommendedHotels = await GetRecommendedHotels(8);

                setHotels(recommendedHotels);
            } catch (err) {
                console.error('Error fetching recommended hotels:', err);
                setError('Failed to load recommended hotels');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedHotels();
    }, []);

    if (loading) {
        return (
            <div {...props} className="swiper-hotel-carousel swiper-hotel-carousel-recommended">
                <div className="">
                    <div className="relative lg:min-h-[666px] md:min-h-[600px] min-h-[500px] w-full overflow-hidden">
                        {/* Background Skeleton */}
                        <Skeleton className="absolute inset-0 w-full h-full" />
                        
                        {/* Gradient Overlay Skeleton */}
                        <div className="absolute inset-0 bg-grey bg-opacity-40"></div>
                        
                        {/* Content Overlay Skeleton */}
                        <div className="absolute inset-0 flex items-end">
                            <div className="lg:mb-[50px] mb-[96px] text-white w-full max-w-[1340px] mx-auto">
                                <div className="max-w-full lg:px-0 px-[20px]">
                                    {/* "HOTEL RECOMMENDED" Skeleton */}
                                    <Skeleton className="h-[22px] w-48 mb-4 bg-white bg-opacity-20" />
                                    
                                    {/* Title Skeleton */}
                                    <Skeleton className="lg:h-[67px] h-[39px] w-3/4 mb-4 bg-white bg-opacity-20" />
                                    
                                    {/* Button Skeleton */}
                                    <Skeleton className="lg:w-auto w-full h-[32px] w-48 bg-white bg-opacity-20" />
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
            <div {...props} className="swiper-hotel-carousel">
                <div className="gs-swiper-init">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hotels || hotels.length === 0) {
        return null; // Don't render anything if no recommended hotels
    }

    return (
        <div {...props} className="swiper-hotel-carousel swiper-hotel-carousel-recommended">
            <div className="">
                <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={1}
                    speed={400}
                    loop={false}
                    autoHeight={false}
                    grabCursor={false}
                    freeMode={false}
                    centeredSlides={true}
                    autoplay={false}
                    breakpoints={{
                        // Mobile (xs)
                        320: {
                            slidesPerView: 1,
                            centeredSlides: true,
                        },
                        // Tablet (md)
                        768: {
                            slidesPerView: 1,
                            centeredSlides: true,
                        },
                        // Desktop
                        1024: {
                            slidesPerView: 1,
                            centeredSlides: true,
                        },
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next-recommended',
                        prevEl: '.swiper-button-prev-recommended',
                    }}
                    onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
                    className="swiper"
                >
                    {hotels.map((hotel) => (
                        <SwiperSlide key={hotel.id}>
                            <div className="relative lg:min-h-[666px] md:min-h-[600px] min-h-[500px] w-full overflow-hidden">
                                {/* Background Image */}
                                {hotel.featuredImage?.node?.sourceUrl ? (
                                    <Image
                                        src={hotel.featuredImage.node.sourceUrl}
                                        alt={hotel.featuredImage.node.altText || hotel.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-300"></div>
                                )}
                               
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 27.4%, rgba(0, 0, 0, 0.8) 100%)' }}></div>
                                
                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex items-end">
                                    <div className="lg:mb-[50px] mb-[96px] text-white w-full max-w-[1340px] mx-auto">
                                        <div className="max-w-full lg:px-0 px-[20px]">

                                            <div className="text-white text-[22px]">
                                                HOTEL HIGHLIGHT
                                            </div>
                                            <h3 className="lg:text-[67px] text-[39px] font-bold mb-[16px] leading-[1.1] lg:mb-[30px]">
                                                {hotel.title}
                                            </h3>
                                            
                                            <Link 
                                                href={`/hotel/${hotel.slug}`}
                                                className="inline-flex gap-[10px] items-center px-[30px] py-[5px] bg-[var(--s-accent)] text-white hover:bg-[var(--s-accent-hover)] text-[22px] transition-colors duration-200 lg:w-auto w-full justify-center"
                                            >
                                                MORE INFORMATION
                                                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 0.707214L6.59 2.11721L12.17 7.70721H0V9.70721H12.17L6.59 15.2972L8 16.7072L16 8.70721L8 0.707214Z" fill="white"/>
                                                </svg>

                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                
                {/* Slide Counter */}
                <div className="absolute lg:bottom-[55px] bottom-[45px] z-10 text-white text-[18px] right-4 lg:right-auto recommended-slide-counter">
                    <span>{currentSlide}</span>/<span>{hotels.length}</span>
                </div>
                {/* Navigation Arrows - Right Side */}
                <div className="absolute lg:bottom-[50px] bottom-[40px] z-10 flex flex-col right-4 lg:right-auto recommended-nav-arrows">
                    <div className="swiper-button-prev swiper-button-prev-recommended swiper-button-prev-custom">
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.6666 6.66671H3.52492L8.18325 2.00837L6.99992 0.833374L0.333252 7.50004L6.99992 14.1667L8.17492 12.9917L3.52492 8.33337H13.6666V6.66671Z"/>
                        </svg>
                    </div>
                    <div className="swiper-button-next swiper-button-next-recommended swiper-button-next-custom">
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.99992 0.833374L5.82492 2.00837L10.4749 6.66671H0.333252V8.33337H10.4749L5.82492 12.9917L6.99992 14.1667L13.6666 7.50004L6.99992 0.833374Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
