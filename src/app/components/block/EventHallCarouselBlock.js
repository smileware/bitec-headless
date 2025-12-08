"use client";

import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useEventHallCarousel } from "../../hooks/useBlockQueries";
import Skeleton from "../ui/Skeleton";
import EventHallCard from "../ui/EventHallCard";

import { usePathname } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Store block ID to index mapping per page (using hash from ID)
const pageBlockMappings = new Map();

export default function EventHallCarouselBlock(props) {
    const [blockIndexAssigned, setBlockIndexAssigned] = useState(null);
    const pathname = usePathname();
    
    // Use React Query hook - automatically caches and deduplicates requests
    const { data, isLoading: loading, error } = useEventHallCarousel();

    // Process and match block data using useMemo
    const eventHallData = useMemo(() => {
        if (!data || !data.eventHalls || data.eventHalls.length === 0) {
            return null;
        }

        // Group event halls by blockIdentifierId (if available) or blockIndex (fallback)
        const blocksByIdentifier = {};
        const blocksByIndex = {};
        
        data.eventHalls.forEach((eventHall) => {
            // Group by blockIdentifierId if available
            if (eventHall.blockIdentifierId) {
                if (!blocksByIdentifier[eventHall.blockIdentifierId]) {
                    blocksByIdentifier[eventHall.blockIdentifierId] = [];
                }
                blocksByIdentifier[eventHall.blockIdentifierId].push(eventHall);
            }
            
            // Also group by blockIndex for fallback
            if (!blocksByIndex[eventHall.blockIndex]) {
                blocksByIndex[eventHall.blockIndex] = [];
            }
            blocksByIndex[eventHall.blockIndex].push(eventHall);
        });

        const blockIndices = Object.keys(blocksByIndex)
            .map(Number)
            .sort((a, b) => a - b);

        // Get the blockIndex to identifier mapping from GraphQL response
        const blockIndexToIdentifier = data.blockIndexToIdentifier || {};

        // Try to match by blockIdentifierId from props OR by blockIndex mapping
        let blockEventHalls = [];
        let blockIndex = 0;
        
        // Check if props has blockIdentifierId (from data attribute)
        const blockIdentifierId = props.dataBlockIdentifierId || 
                                 props['data-block-identifier-id'] ||
                                 props['dataBlockIdentifierId'] ||
                                 props.blockIdentifierId ||
                                 props['blockIdentifierId'] ||
                                 null;
        
        // Strategy 1: If identifier provided in props, use it
        if (blockIdentifierId && blocksByIdentifier[blockIdentifierId]) {
            blockEventHalls = blocksByIdentifier[blockIdentifierId];
        }
        // Strategy 2: Map blockIndex to identifier
        else if (blockIndexAssigned === null && props.id) {
            const pageKey = pathname;
            
            // Initialize page mapping if it doesn't exist
            if (!pageBlockMappings.has(pageKey)) {
                pageBlockMappings.set(pageKey, {
                    idToIndex: new Map(),
                    counter: 0
                });
            }
            
            const pageMapping = pageBlockMappings.get(pageKey);
            
            // Check if this block ID already has an assigned index
            if (pageMapping.idToIndex.has(props.id)) {
                blockIndex = pageMapping.idToIndex.get(props.id);
            } else {
                // Assign the next available block index based on mounting order
                blockIndex = blockIndices[pageMapping.counter % blockIndices.length];
                pageMapping.idToIndex.set(props.id, blockIndex);
                pageMapping.counter++;
            }
            
            // Save the assigned block index
            setBlockIndexAssigned(blockIndex);
            
            // Map blockIndex to identifier using the mapping from GraphQL
            const identifierByIndex = blockIndexToIdentifier[blockIndex];
            if (identifierByIndex && blocksByIdentifier[identifierByIndex]) {
                blockEventHalls = blocksByIdentifier[identifierByIndex];
            } else {
                // Fallback to blockIndex-based grouping
                blockEventHalls = blocksByIndex[blockIndex] || [];
            }
        } else if (blockIndexAssigned !== null) {
            // Use the previously assigned block index
            blockIndex = blockIndexAssigned;
            
            // Map blockIndex to identifier using the mapping from GraphQL
            const identifierByIndex = blockIndexToIdentifier[blockIndex];
            if (identifierByIndex && blocksByIdentifier[identifierByIndex]) {
                blockEventHalls = blocksByIdentifier[identifierByIndex];
            } else {
                blockEventHalls = blocksByIndex[blockIndex] || [];
            }
        } else {
            // Last resort: use first block
            blockIndex = blockIndices[0] || 0;
            const identifierByIndex = blockIndexToIdentifier[blockIndex];
            if (identifierByIndex && blocksByIdentifier[identifierByIndex]) {
                blockEventHalls = blocksByIdentifier[identifierByIndex];
            } else {
                blockEventHalls = blocksByIndex[blockIndex] || [];
            }
        }

        return {
            eventHalls: blockEventHalls,
        };
    }, [data, props.id, pathname, blockIndexAssigned, props.dataBlockIdentifierId, props['data-block-identifier-id'], props['dataBlockIdentifierId'], props.blockIdentifierId, props['blockIdentifierId']]);

    if (loading) {
        return (
            <div
                {...props}
                className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel"
            >
                <div className="gs-swiper-init">
                    <div className="">
                        <div className="">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[16px] lg:gap-[30px] min-h-[600px] px-[20px]">
                                <div className="p-4 bg-white">
                                    <Skeleton
                                        width="w-full"
                                        height="h-100"
                                        rounded="rounded-md"
                                        className="mb-3"
                                    />
                                    <Skeleton
                                        width="w-3/4"
                                        height="h-6"
                                        className="mb-2"
                                    />
                                    <Skeleton
                                        width="w-1/2"
                                        height="h-4"
                                        className="mb-2"
                                    />
                                    <Skeleton width="w-full" height="h-4" />
                                </div>
                                <div className="p-4 bg-white hidden lg:block md:block">
                                    <Skeleton
                                        width="w-full"
                                        height="h-100"
                                        rounded="rounded-md"
                                        className="mb-3"
                                    />
                                    <Skeleton
                                        width="w-3/4"
                                        height="h-6"
                                        className="mb-2"
                                    />
                                    <Skeleton
                                        width="w-1/2"
                                        height="h-4"
                                        className="mb-2"
                                    />
                                    <Skeleton width="w-full" height="h-4" />
                                </div>
                                <div className="p-4 bg-white hidden lg:block">
                                    <Skeleton
                                        width="w-full"
                                        height="h-100"
                                        rounded="rounded-md"
                                        className="mb-3"
                                    />
                                    <Skeleton
                                        width="w-3/4"
                                        height="h-6"
                                        className="mb-2"
                                    />
                                    <Skeleton
                                        width="w-1/2"
                                        height="h-4"
                                        className="mb-2"
                                    />
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
            <div
                {...props}
                className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel"
            >
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-events-message text-center opacity-50">
                                Error loading event hall content:{" "}
                                {error.message}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (
        !eventHallData ||
        !eventHallData.eventHalls ||
        eventHallData.eventHalls.length === 0
    ) {
        return (
            <div
                {...props}
                className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel"
            >
                <div className="gs-swiper-init">
                    <div className="swiper">
                        <div className="swiper-wrapper">
                            <div className="no-events-message text-center opacity-50">
                                No event halls found.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                {...props}
                className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel event-hall-carousel"
            >
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
                                slidesOffsetAfter: 0,
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
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}
                        pagination={{
                            el: ".swiper-pagination",
                            clickable: true,
                        }}
                        className="swiper event-hall-swiper"
                        wrapperClass="swiper-wrapper event-hall-wrapper"
                    >
                        {eventHallData.eventHalls.map((eventHall) => (
                            <SwiperSlide key={eventHall.id}>
                                <button
                                    type="button"
                                    popoverTarget={`pop_${eventHall.id}`}
                                    className="open-popup block w-full text-left cursor-pointer"
                                >
                                    <EventHallCard eventHall={eventHall} />
                                </button>
                            </SwiperSlide>
                        ))}
                        <div className="swiper-pagination"></div>
                    </Swiper>

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
            </div>

            {/* POPUP */}
            {eventHallData.eventHalls.map((eventHall) => (
                <div
                    id={`pop_${eventHall.id}`}
                    popover="auto"
                    key={`pop_${eventHall.id}`}
                    className="shadow-xl"
                >
                    <button
                        type="button"
                        popoverTarget={`pop_${eventHall.id}`}
                        popoverTargetAction="hide"
                        className="popup-close"
                        aria-label="Close"
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.67676 0.208332L0.208007 1.67708L6.03092 7.5L0.208008 13.3229L1.67676 14.7917L7.49967 8.96875L13.3226 14.7917L14.7913 13.3229L8.96842 7.5L14.7913 1.67708L13.3226 0.208331L7.49967 6.03125L1.67676 0.208332Z" fill="white"/>
                        </svg>
                    </button>

                    <div className="flex flex-col lg:flex-row min-h-[412px]">
                        <div className="swiper-popup w-full lg:w-[50%]">
                            <Swiper
                                modules={[Pagination]} 
                                slidesPerView={1}
                                navigation={false}
                                pagination={{
                                    el: `.swiper-pagination`,
                                    clickable: true,
                                }}
                                className="swiper eventhall-popup-swiper h-full"
                                wrapperClass="swiper-wrapper event-hall-wrapper"
                            >
                                {eventHall.gallery && eventHall.gallery.length > 0 ? (
                                    eventHall.gallery.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <img
                                                src={img.sourceUrl}
                                                alt={img.altText}
                                                className="w-full h-full min-h-[320px] object-cover"
                                            />
                                        </SwiperSlide>
                                    ))
                                ) : (
                                    <SwiperSlide>
                                        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 text-gray-400">
                                            No images available
                                        </div>
                                    </SwiperSlide>
                                )}
                                <div className={`swiper-pagination`}></div>
                            </Swiper>
                        </div>
                        <div className="lg:px-[50px] lg:py-[50px] px-[20px] py-[30px] w-full lg:w-[50%]">
                            <h2 className="text-[#3D3D3F] font-[500] text-[30px] leading-[1.1]">{eventHall.title}</h2>
                            <p className="text-[#3D3D3F] text-[20px] leading-[1.2] lg:mt-[20px] mt-[10px]">
                                {eventHall.description}
                            </p>
                            <div className="grid grid-cols-2 lg:gap-[20px] gap-[12px] mt-[30px]">
                                {eventHall.detail && eventHall.detail.length > 0 && eventHall.detail.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-[15px]">
                                        <div className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center">
                                            {detail.iconSvg ? (
                                                <span
                                                    className="inline-block w-[24px] h-[24px]"
                                                    dangerouslySetInnerHTML={{ __html: detail.iconSvg }}
                                                />
                                            ) : detail.iconImage ? (
                                                <img
                                                    src={detail.iconImage.node.sourceUrl}
                                                    alt=""
                                                    className="w-[24px] h-[24px] object-contain"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="flex-1 text-[#67676A] text-[20px] leading-[1]"
                                            dangerouslySetInnerHTML={{ __html: detail.iconDetail }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
