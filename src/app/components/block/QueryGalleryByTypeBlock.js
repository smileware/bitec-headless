'use client';

import { useEffect, useState } from 'react';
import { GetPageWithQueryGalleryByType, GetGalleryByTaxonomyType } from '../../lib/block';
import Skeleton from '../ui/Skeleton';
import GalleryCard from '../ui/GalleryCard';

// Custom hook to detect screen size (same as WhatsOnBlock)
function useScreenSize() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile on mount and resize
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1023); // md breakpoint (same as WhatsOnBlock)
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export default function QueryGalleryByTypeBlock(props) {
    const [galleryData, setGalleryData] = useState(null);
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMobile = useScreenSize();



    useEffect(() => {
        async function fetchGalleryData() {
            try {

                const currentPath = window.location.pathname;
                const slug = currentPath === '/' ? 'home' : currentPath.replace(/^\//, '').replace(/\/$/, '');
                
                const data = await GetPageWithQueryGalleryByType(slug);
                setGalleryData(data);
                // If we have a taxonomy ID, fetch the gallery items
                if (data?.queryGalleryByType) {
                    const limit = isMobile ? 3 : 5;
                    const items = await GetGalleryByTaxonomyType(data.queryGalleryByType, limit);
                    setGalleryItems(items);
                } else {
                    console.log('No taxonomy ID found in gallery data:', data);
                }

            } catch (error) {
                setError(error);
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGalleryData();
    }, [isMobile]);


    if (loading) {
        return (
            <div {...props} className={`query-gallery-by-type-block ${props.className || ''}`}>
                <div className="max-w-[1380px] mx-auto">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[30px]">
                        <div className="mb-12">
                            <Skeleton width="w-1/3" height="h-10" rounded="rounded-md" className="mb-4" />
                            <Skeleton width="w-2/3" height="h-6" rounded="rounded-md" className="mb-2" />
                            <Skeleton width="w-1/2" height="h-6" rounded="rounded-md" className="mb-6" />
                            <Skeleton width="w-32" height="h-12" rounded="rounded-lg" />
                        </div>
                        {[...Array(isMobile ? 3 : 5)].map((_, index) => (
                            <div key={index} className="gallery-item rounded-xl p-4">
                                <Skeleton width="w-full" height="h-48" rounded="rounded-lg" className="mb-4" />
                                <Skeleton width="w-3/4" height="h-5" rounded="rounded-md" className="mb-2" />
                                <Skeleton width="w-full" height="h-4" rounded="rounded-md" className="mb-3" />
                                <Skeleton width="w-24" height="h-4" rounded="rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className={`query-gallery-by-type-block bg-gray-50 py-16 ${props.className || ''}`}>
                <div className="max-w-[1340px] mx-auto px-4">
                    <div className="text-center py-8">
                        <p className="text-red-600 text-lg">Error loading gallery content.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!galleryData) {
        return (
            <div {...props} className={`query-gallery-by-type-block bg-gray-50 py-16 ${props.className || ''}`}>
                <div className="max-w-[1340px] mx-auto px-4">
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No gallery content found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { queryGalleryByType, queryGalleryTitle, queryGalleryDescription, queryGalleryLink } = galleryData;

    return (
        <div {...props} className={`query-gallery-by-type-block ${props.className || ''}`}>
            <div className="max-w-[1380px] mx-auto">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[30px]">
                    {/* Header Section */}
                    <div className="">
                        {queryGalleryTitle && (
                            <h2 className="text-white lg:text-[67px] text-[42px] font-bold leading-[1.1] mb-2">
                                {queryGalleryTitle}
                            </h2>
                        )}
                        
                        {queryGalleryDescription && (
                            <p className="text-white lg:text-[30px] text-[24px] leading-[1.1] lg:mb-12 mb-0">
                                {queryGalleryDescription}
                            </p>
                        )}
                        
                        {queryGalleryLink && queryGalleryLink.url && (
                            <a
                                href={queryGalleryLink.url}
                                target={queryGalleryLink.target || '_self'}
                                rel={queryGalleryLink.target === '_blank' ? 'noopener noreferrer' : ''}
                                className="lg:inline-flex hidden items-center px-[30px] py-[8px] bg-transparent text-white font-400 border border-white text-[22px] hover:bg-[var(--s-accent-hover)] hover:border-[var(--s-accent-hover)]  transition-all duration-200"
                            >
                                {queryGalleryLink.title || 'MORE GALLERY'}
                            </a>
                        )}
                    </div>

                    {/* Gallery Content Section */}
                    <>
                        {galleryItems.length > 0 ? (
                            <>
                                {galleryItems.map((item) => (
                                    <GalleryCard key={item.id} gallery={item} />
                                ))}
                            </>
                        ) : null}
                    </>
                </div>
                {queryGalleryLink && queryGalleryLink.url && (
                    <a
                        href={queryGalleryLink.url}
                        target={queryGalleryLink.target || '_self'}
                        rel={queryGalleryLink.target === '_blank' ? 'noopener noreferrer' : ''}
                        className="lg:hidden inline-flex items-center px-[30px] py-[8px] bg-transparent text-white font-400 border border-white text-[22px] hover:bg-[var(--s-accent-hover)] hover:border-[var(--s-accent-hover)]  transition-all duration-200 text-center justify-center mt-[25px] w-full"
                    >
                        {queryGalleryLink.title || 'MORE GALLERY'}
                    </a>
                )}
            </div>
        </div>
    );
}
