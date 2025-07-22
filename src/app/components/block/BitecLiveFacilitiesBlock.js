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
                const facilitiesData = await GetPageWithBitecLiveFacilities("bitec-live");
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
    );
}
