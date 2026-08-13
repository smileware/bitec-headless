"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import GalleryCard from '../../components/ui/GalleryCard';
import { fetchContentApi } from '../../lib/clientContentApi';
import NotFoundState from '../../components/ui/NotFoundState';

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

export default function GalleryTypeArchive({ params }) {
    const { slug } = React.use(params);
    const isMobile = useScreenSize();
    const [galleries, setGalleries] = useState([]);
    const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageCursors, setPageCursors] = useState({ 1: null });
    const [term, setTerm] = useState(null);
    const [termLoading, setTermLoading] = useState(true);


    const PAGE_SIZE = isMobile ? 6 : 12;

    const fetchGalleries = async (page = 1, pageSize = PAGE_SIZE) => {
        setLoading(true);
        const after = pageCursors[page] ?? null;
        const res = await fetchContentApi('/api/content/galleries', {
            mode: 'archive',
            slug,
            limit: pageSize,
            after,
            language: 'en',
        });
        setGalleries(res.galleries);
        setPageInfo(res.pageInfo);
        if (res.pageInfo?.hasNextPage && res.pageInfo.endCursor) {
            setPageCursors(previous => ({
                ...previous,
                [page]: after,
                [page + 1]: res.pageInfo.endCursor,
            }));
        }
        setLoading(false);
        setTotalPages(res.pageInfo.hasNextPage ? page + 1 : page);
    };

    const fetchTerm = async () => {
        setTermLoading(true);
        try {
            const termData = await fetchContentApi('/api/content/galleries', {
                mode: 'term',
                slug,
                language: 'en',
            });
            setTerm(termData);
        } catch {
            setTerm(null);
        } finally {
            setTermLoading(false);
        }
    } 

    useEffect(() => {
        setPageCursors({ 1: null });
        fetchGalleries(1, PAGE_SIZE);
        setCurrentPage(1);
        fetchTerm();
    }, [slug, PAGE_SIZE]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchGalleries(page, PAGE_SIZE);
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

    if ((loading || termLoading) && galleries.length === 0) {
        return (
            <div className="bg-[#F4F4F4] lg:py-[50px] py-[40px] px-[20px]">
                <div className="max-w-[1340px] mx-auto">
                    <div className="mb-[40px]">
                        <div className="h-8 bg-gray-200 rounded mb-2 w-[100px]"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4 w-[500px]"></div>
                    </div>
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

    if (!termLoading && !term) {
        return <NotFoundState language="en" />;
    }

    return (
        <div className="bg-[#F4F4F4] lg:py-[50px] py-[40px] px-[20px]">
            <div className="max-w-[1340px] mx-auto">
                <h1 className="lg:text-[51px] text-[39px] text-[#161616] font-bold leading-[1.1]">
                    {term ? term.name : slug}
                </h1>
                {term && term.description && <p className="lg:text-[30px] text-[24px] text-[#161616] lg:mb-[40px] mb-[20px] leading-[1.1]">{term.description}</p>}

                <div className="gallery-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map(gallery => (
                        <GalleryCard key={gallery.id} gallery={gallery} />
                    ))}
                </div>
                {renderPagination()}
                {loading && galleries.length > 0 && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
