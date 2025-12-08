'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDisplayGalleryByType, useGalleriesByTypes } from '../../hooks/useBlockQueries';
import GalleryCard from '../ui/GalleryCard';

// Custom hook to detect screen size
function useScreenSize() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1023);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
}

export default function GalleryBlock(props) {
    const isMobile = useScreenSize();
    const [currentPage, setCurrentPage] = useState(1);

    const PAGE_SIZE = isMobile ? 6 : 12;

    // Use React Query hooks - automatically caches and deduplicates requests
    const { data: galleryConfig, isLoading: configLoading, error: configError } = useDisplayGalleryByType();
    
    // Extract type slugs from config (can be array or null)
    // Memoize to ensure stable reference for React Query
    const typeSlugs = useMemo(() => {
        return galleryConfig?.displayGalleryByType || null;
    }, [galleryConfig?.displayGalleryByType]);
    
    // Enable query once config is loaded (even if typeSlugs is null, GetGalleriesByTypes will fetch all)
    const shouldFetchGalleries = !configLoading && galleryConfig !== undefined;
    
    const { data: allGalleries = [], isLoading: galleriesLoading, error: galleriesError } = useGalleriesByTypes(
        typeSlugs,
        1000,
        shouldFetchGalleries
    );
    
    // Debug logging (remove in production)
    useEffect(() => {
        if (galleryConfig !== undefined) {
            console.log('GalleryBlock - Config loaded:', {
                displayGalleryByType: galleryConfig?.displayGalleryByType,
                typeSlugs,
                shouldFetchGalleries,
                allGalleriesCount: allGalleries.length
            });
        }
    }, [galleryConfig, typeSlugs, shouldFetchGalleries, allGalleries.length]);

    const loading = configLoading || galleriesLoading;
    const error = configError || galleriesError;

    // Calculate pagination
    const totalPages = useMemo(() => {
        return Math.ceil(allGalleries.length / PAGE_SIZE);
    }, [allGalleries.length, PAGE_SIZE]);

    const displayedGalleries = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return allGalleries.slice(startIndex, endIndex);
    }, [allGalleries, currentPage, PAGE_SIZE]);

    // Reset to page 1 when PAGE_SIZE changes
    useEffect(() => {
        setCurrentPage(1);
    }, [PAGE_SIZE]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={`theme-pagination -prev${currentPage === 1 ? ' disable' : ''}`}
                disabled={currentPage === 1}
            >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.26367 2.2625L3.53867 8L9.26367 13.7375L7.50117 15.5L0.00117141 8L7.50117 0.5L9.26367 2.2625Z" fill="#CE0E2D"/>
                </svg>
            </button>
        );
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`theme-pagination${i === currentPage ? ' active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={`theme-pagination -next${currentPage === totalPages ? ' disable' : ''}`}
                disabled={currentPage === totalPages}
            >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.738281 13.7375L6.46328 8L0.738281 2.2625L2.50078 0.5L10.0008 8L2.50078 15.5L0.738281 13.7375Z" fill="#CE0E2D"/>
                </svg>
            </button>
        );
        return (
            <div className="flex justify-center items-center mt-[50px] mb-4">
                {pages}
            </div>
        );
    };

    if (loading) {
        return (
            <div {...props} className={`display-gallery-block bg-[#F4F4F4] lg:py-[50px] py-[20px] ${props.className || ''}`}>
                <div className="max-w-[1340px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                        {[...Array(PAGE_SIZE)].map((_, index) => (
                            <div key={index} className="content-item -card animate-pulse">
                                <div className="pic bg-gray-200 h-48"></div>
                                <div className="info p-5">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className={`display-gallery-block bg-[#F4F4F4] lg:py-[50px] py-[20px] ${props.className || ''}`}>
                <div className="max-w-[1340px] mx-auto">
                    <div className="text-center py-8">
                        <p className="text-red-600 text-lg">Error loading gallery content.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!allGalleries || allGalleries.length === 0) {
        return (
            <div {...props} className={`display-gallery-block bg-[#F4F4F4] lg:py-[50px] py-[20px] ${props.className || ''}`}>
                <div className="max-w-[1340px] mx-auto">
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No galleries found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div {...props} className={`display-gallery-block bg-[#F4F4F4] lg:py-[50px] py-[20px] ${props.className || ''}`}>
            <div className="max-w-[1340px] mx-auto">
                <div className="gallery-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGalleries.map(gallery => (
                        <GalleryCard key={gallery.id} gallery={gallery} />
                    ))}
                </div>
                {renderPagination()}
            </div>
        </div>
    );
}

