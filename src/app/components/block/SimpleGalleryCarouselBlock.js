'use client';

import { useState, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import { useSimpleGalleryCarousel } from '../../hooks/useBlockQueries';
import Skeleton from '../ui/Skeleton';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function SimpleGalleryCarouselBlock(props) {
    const [current, setCurrent] = useState(1);
    const blockIndexRef = useRef(null);
    
    // Use React Query hook - automatically caches and deduplicates requests
    const { data, isLoading: loading, error } = useSimpleGalleryCarousel();
    
    // Process gallery data to handle multiple blocks on same page
    const galleryData = useMemo(() => {
        if (!data || !data.simpleGalleryCarousels || data.simpleGalleryCarousels.length === 0) {
            return data;
        }
        
        // Group galleries by block index
        const blocks = {};
        data.simpleGalleryCarousels.forEach(gallery => {
            if (!blocks[gallery.blockIndex]) {
                blocks[gallery.blockIndex] = [];
            }
            blocks[gallery.blockIndex].push(gallery);
        });
        
        const blockIndices = Object.keys(blocks).map(Number).sort((a, b) => a - b);
        
        if (blockIndexRef.current === null) {
            // Use simple counter for block assignment
            if (!window.simpleGalleryBlockCount) {
                window.simpleGalleryBlockCount = 0;
            }
            blockIndexRef.current = window.simpleGalleryBlockCount++;
        }
        
        const blockIndex = blockIndices[blockIndexRef.current % blockIndices.length];
        const blockGalleries = blocks[blockIndex] || [];
        
        return {
            simpleGalleryCarousels: blockGalleries
        };
    }, [data]);

    if (loading) {
        return (
            <div {...props} className="simple-gallery-carousel-block">
                <div className="relative mb-[60px]">
                    {/* Swiper skeleton */}
                    <div className="flex gap-4 overflow-hidden justify-center">
                        <div className="flex-shrink-0 w-full max-w-4xl">
                            <Skeleton width="w-full" height="h-[400px]" rounded="rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className="simple-gallery-carousel-block">
                <div className="text-center text-red-500">
                    Error loading simple gallery carousel: {error.message}
                </div>
            </div>
        );
    }

    if (!galleryData || !galleryData.simpleGalleryCarousels || galleryData.simpleGalleryCarousels.length === 0) {
        return (
            <div {...props} className="simple-gallery-carousel-block">
                <div className="text-center text-gray-500">
                    No simple gallery carousels found.
                </div>
            </div>
        );
    }



    return (
        <div {...props} className="simple-gallery-carousel-block simple-gallery-carousel">
            {galleryData.simpleGalleryCarousels.map((gallery, index) => (
                <div key={index}>
                    {gallery.simpleGalleryCarousel && gallery.simpleGalleryCarousel.nodes && gallery.simpleGalleryCarousel.nodes.length > 0 && (
                        <div className={`relative swiper-gallery simple-gallery-carousel-${blockIndexRef.current}`}>
                            <Swiper
                                modules={[Navigation, Pagination]}
                                slidesPerView={1}
                                spaceBetween={30}
                                loop={true}
                                navigation={{
                                    nextEl: '.swiper-button-next',
                                    prevEl: '.swiper-button-prev',
                                }}
                                pagination={{
                                    clickable: true,
                                    el: '.swiper-pagination',
                                }}
                                className="swiper simple-gallery-swiper"
                                wrapperClass="swiper-wrapper simple-gallery-wrapper"
                                onSlideChange={(swiper) => setCurrent(swiper.activeIndex + 1)}
                            >
                                {gallery.simpleGalleryCarousel.nodes.map((img, idx) => (
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
                                <div className="swiper-pagination"></div>
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
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
