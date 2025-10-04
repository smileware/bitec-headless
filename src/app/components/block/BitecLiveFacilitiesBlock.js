"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Skeleton from "../ui/Skeleton";
import { GetPageWithBitecLiveFacilities } from "../../lib/block";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function BitecLiveFacilitiesBlock(props) {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFacilities() {
            try {

                const path = window.location.pathname.replace(/^\/|\/$/g, "");
                const parts = path.split("/").filter(Boolean);
                const hasLangPrefix = parts[0] === "th";
                const isTH = hasLangPrefix;
                const slug = hasLangPrefix ? (parts.slice(1).join("/") || "home") : (path || "home");
                const facilitiesData = await GetPageWithBitecLiveFacilities(slug, isTH);
                // const facilitiesData = await GetPageWithBitecLiveFacilities("bitec-live");

                setFacilities(facilitiesData);
            } catch (error) {
                setError(error);
                console.error("Error fetching facilities:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFacilities();
    }, []);

    if (loading) {
        return (
            <div
                {...props}
                className={`wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel ${props.className || ''}`}
            >
                <div className="gs-swiper-init">
                    <div className="">
                        <div className="">
                            <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 lg:px-[0] px-[20px]">
                                <div className="p-4 bg-white">
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-full" height="h-60" rounded="rounded-md" />
                                </div>
                                <div className="p-4 bg-white lg:block hidden">
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-full" height="h-60" rounded="rounded-md" />
                                </div>
                                <div className="p-4 bg-white lg:block hidden">
                                    <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                                    <Skeleton width="w-full" height="h-60" rounded="rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div {...props} className={`swiper-bitec-facilities ${props.className || ''}`}>Error loading facilities.</div>;
    }

    return (
        <div {...props} className={`swiper-bitec-facilities ${props.className || ''}`}>
            <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={3}
                spaceBetween={40}
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
                        slidesPerView: 1.3,
                        spaceBetween: 20,
                        slidesOffsetBefore: 20,
                        slidesOffsetAfter: 20,
                    },
                    // Tablet (md)
                    768: {
                        slidesPerView: 2.3,
                        spaceBetween: 20,
                    },
                    // Desktop
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 40,
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
                className="swiper"
            >
                {facilities
                    .filter(facility => facility.image?.node?.sourceUrl)
                    .map((facility, idx) => (
                        <SwiperSlide key={facility.image.node.id || facility.image.node.sourceUrl + idx}>
                            <button
                                type="button"
                                popoverTarget={`pop_facility_${idx}`}
                                className="open-popup block w-full text-left cursor-pointer"
                            >
                                <div className="bg-white">
                                    <div className="py-[30px] px-[20px] min-h-[125px] relative">
                                        <h3 className="text-[40px] text-[#161616] font-medium leading-[35px]">
                                            {facility.name}
                                        </h3>
                                        <div className="bg-[#91238C] absolute top-0 right-0 w-[30px] h-[30px]"></div>
                                    </div>
                                    <Image
                                        src={facility.image.node.sourceUrl}
                                        alt={facility.image.node.altText || facility.name || 'Facility image'}
                                        width={1380}
                                        height={250}
                                        className="w-full lg:h-[250px] h-[195px] object-cover"
                                    />
                                </div>
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

            {/* POPUP */}
            {facilities.map((facility, idx) => (
                <div
                    id={`pop_facility_${idx}`}
                    popover="auto"
                    key={`pop_facility_${idx}`}
                    className="shadow-xl"
                >
                    <button
                        type="button"
                        popoverTarget={`pop_facility_${idx}`}
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
                                {facility.gallery && facility.gallery.length > 0 ? (
                                    facility.gallery.map((img, idx) => (
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
                        <div className="lg:px-[50px] lg:py-[50px] px-[20px] py-[30px] w-full lg:w-[50%] flex flex-col justify-center">
                            <h2 className="text-[#3D3D3F] font-[500] text-[30px] leading-[1.1]">{facility.name}</h2>
                            <p className="text-[#3D3D3F] text-[20px] leading-[1.2] lg:mt-[20px] mt-[10px]">
                                {facility.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
