"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";

export default function GallerySwiper({ images }) {
    const [current, setCurrent] = useState(1);

    return (
        <div className="relative swiper-gallery">
            <Swiper
                modules={[Navigation]}
                slidesPerView={1.5}
                centeredSlides={true}
                loop={true}
                watchOverflow={false}
                spaceBetween={30}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                    disabledClass: 'swiper-button-disabled-custom',
                }}
                className="swiper"
                breakpoints={{
                    320: {
                        slidesPerView: 1.2,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 1.5,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 1.5,
                        spaceBetween: 30,
                    },
                }}
                onSlideChange={(swiper) => {
                    // Use realIndex for accurate counting in loop mode
                    setCurrent((swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex) + 1);
                }}
            >
                {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="relative h-[400px]">
                            {(img.url || img.sourceUrl) && (img.url || img.sourceUrl).trim() !== '' ? (
                                <Image
                                    src={img.url || img.sourceUrl}
                                    alt={img.alt || img.altText || `Gallery image ${idx + 1}`}
                                    fill
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            {/* Navigation Arrows */}

            <div className="swiper-button-prev">
                <svg
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M13.6666 6.66671H3.52492L8.18325 2.00837L6.99992 0.833374L0.333252 7.50004L6.99992 14.1667L8.17492 12.9917L3.52492 8.33337H13.6666V6.66671Z" />
                </svg>
            </div>
            <div className="swiper-button-next">
                <svg
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M6.99992 0.833374L5.82492 2.00837L10.4749 6.66671H0.333252V8.33337H10.4749L5.82492 12.9917L6.99992 14.1667L13.6666 7.50004L6.99992 0.833374Z" />
                </svg>
            </div>

            {/* Slide Counter */}
            <div className="text-[18px] text-[#636363] text-center my-5">
                <span>{current}</span> / <span>{images.length}</span>
            </div>
        </div>
    );
}
