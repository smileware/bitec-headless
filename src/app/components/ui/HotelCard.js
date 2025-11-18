'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HotelCard({ hotel }) {
    const pathname = usePathname();
    // Simple language detection from URL path
    const getCurrentLanguage = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        
        if (pathSegments.length > 0) {
            const firstSegment = pathSegments[0];
            if (['th', 'en'].includes(firstSegment)) {
                return firstSegment;
            }
        }
        return 'en'; // default to English
    };
    
    const currentLang = getCurrentLanguage();
    
    // Check if hotel has "Recommend" category
    const hasRecommendCategory = hotel.hotelCategories?.nodes?.some(category => 
        category.name === 'Recommend' || category.slug === 'recommend'
    );

    return (
        <article className="bg-white h-full">
            <div className="pic relative">
                <Link
                    href={
                        currentLang === 'th'
                            ? `/th/hotel/${hotel.translations && hotel.translations[0]?.slug ? hotel.translations[0].slug : hotel.slug}`
                            : `/hotel/${hotel.slug}`
                    }
                    prefetch={true}
                    title={`Permalink to ${currentLang === 'th'
                        ? (hotel.translations && hotel.translations[0]?.title ? hotel.translations[0].title : hotel.title)
                        : hotel.title
                    }`}
                >
                    <Image
                        src={hotel.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                        alt={hotel.featuredImage?.node?.altText || hotel.title}
                        width={400}
                        height={250}
                        className="w-full h-auto object-cover min-h-[250px] max-h-[250px]"
                    />
                </Link>
                {hasRecommendCategory && (
                    <div className="absolute bottom-[20px] lg:left-[30px] left-[20px] bg-[#CE0E2D] text-white px-[20px] py-[2px] rounded-full text-[16px] font-[400] flex items-center gap-[10px]">
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.61967 6.16683L6.99967 0.833496L5.37967 6.16683H0.333008L4.45301 9.10683L2.88634 14.1668L6.99967 11.0402L11.1197 14.1668L9.55301 9.10683L13.6663 6.16683H8.61967Z" fill="white"/>
                        </svg>
                        Recommend
                    </div>
                )}
            </div>
            <div className="lg:p-[30px] p-[20px]">
                <header className="entry-header">
                    <h2 className="entry-title text-[#161616] lg:text-[30px] text-[24px] font-[500] leading-[1.2] mb-[10px]">
                        <Link
                            href={
                                currentLang === 'th'
                                    ? `/th/hotel/${hotel.translations && hotel.translations[0]?.slug ? hotel.translations[0].slug : hotel.slug}`
                                    : `/hotel/${hotel.slug}`
                            }
                            prefetch={true}
                        >
                            {currentLang === 'th'
                                ? (hotel.translations && hotel.translations[0]?.title ? hotel.translations[0].title : hotel.title)
                                : hotel.title
                            }
                        </Link>
                    </h2>
                </header>
                <div className="entry-excerpt">
                    {hotel.excerpt && (
                        <div
                            className="text-[#454545] lg:text-[25px] text-[20px] font-[400] leading-[1.4] line-clamp-4 mb-[10px]"
                            dangerouslySetInnerHTML={{
                                __html: currentLang === 'th'
                                    ? (hotel.translations && hotel.translations[0]?.excerpt ? hotel.translations[0].excerpt : hotel.excerpt)
                                    : hotel.excerpt
                            }}
                        />
                    )}
                </div>
                    
                <div className="flex gap-[20px]">
                    {hotel.hotelDetail.hotelShortAddress?.length > 0 && (
                        <div className="flex gap-[8px] items-center text-[#3D3D3F] text-[16px]">
                            <svg className="w-[16px] h-[16px]" width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.99967 0.833496C2.41967 0.833496 0.333008 2.92016 0.333008 5.50016C0.333008 9.00016 4.99967 14.1668 4.99967 14.1668C4.99967 14.1668 9.66634 9.00016 9.66634 5.50016C9.66634 2.92016 7.57967 0.833496 4.99967 0.833496ZM4.99967 7.16683C4.07967 7.16683 3.33301 6.42016 3.33301 5.50016C3.33301 4.58016 4.07967 3.8335 4.99967 3.8335C5.91967 3.8335 6.66634 4.58016 6.66634 5.50016C6.66634 6.42016 5.91967 7.16683 4.99967 7.16683Z" fill="#CE0E2D"/>
                            </svg>

                            {hotel.hotelDetail.hotelShortAddress}
                        </div>
                    )}
                    {hotel.hotelDetail.hotelTransportation?.length > 0 && (
                        <div className="flex gap-[8px] items-center text-[#3D3D3F] text-[16px]">
                            <svg className="w-[16px] h-[16px]" width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.00033 0.833496C3.33366 0.833496 0.666992 1.16683 0.666992 3.50016V9.8335C0.666992 11.1202 1.71366 12.1668 3.00033 12.1668L2.00033 13.1668V13.5002H3.48699L4.82032 12.1668H7.33366L8.66699 13.5002H10.0003V13.1668L9.00033 12.1668C10.287 12.1668 11.3337 11.1202 11.3337 9.8335V3.50016C11.3337 1.16683 8.94699 0.833496 6.00033 0.833496ZM3.00033 10.8335C2.44699 10.8335 2.00033 10.3868 2.00033 9.8335C2.00033 9.28016 2.44699 8.8335 3.00033 8.8335C3.55366 8.8335 4.00033 9.28016 4.00033 9.8335C4.00033 10.3868 3.55366 10.8335 3.00033 10.8335ZM5.33366 6.16683H2.00033V3.50016H5.33366V6.16683ZM6.66699 6.16683V3.50016H10.0003V6.16683H6.66699ZM9.00033 10.8335C8.44699 10.8335 8.00033 10.3868 8.00033 9.8335C8.00033 9.28016 8.44699 8.8335 9.00033 8.8335C9.55366 8.8335 10.0003 9.28016 10.0003 9.8335C10.0003 10.3868 9.55366 10.8335 9.00033 10.8335Z" fill="#CE0E2D"/>
                            </svg>

                            {hotel.hotelDetail.hotelTransportation}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
} 