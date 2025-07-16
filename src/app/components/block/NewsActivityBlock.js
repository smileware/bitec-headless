'use client';

import React, { useState, useEffect } from 'react';
import { getNewsActivityContent } from '../../lib/news-activity';
import NewsCard from '../ui/NewsCard';
import { usePathname } from 'next/navigation';

export default function NewsActivityBlock(props) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
    const [totalPages, setTotalPages] = useState(0);
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
        return 'en';
    };

    const currentLang = getCurrentLanguage();

    const fetchNews = async (page = 1) => {
        setLoading(true);
        try {
            const result = await getNewsActivityContent(page, 9, currentLang);
            setNews(result.content);
            setPageInfo(result.pageInfo);
            
            if (page === 1) {
                setTotalPages(result.pageInfo.hasNextPage ? 2 : 1);
            } else {
                setTotalPages(result.pageInfo.hasNextPage ? page + 1 : page);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(1);
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchNews(page);
        // Scroll to top of the component
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
        // Always show Previous button, add -disable if on first page
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

        // Always show Next button, add -disable if on last page
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
            <div className="flex justify-center items-center mt-8 mb-4">
                {pages}
            </div>
        );
    };

    if (loading && news.length === 0) {
        return (
            <div {...props} className="max-w-[1340px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                    {[...Array(9)].map((_, index) => (
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
        );
    }

    return (
        <div {...props} className="max-w-[1340px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-[30px] gap-x-[20px] lg:gap-y-[40px] gap-y-[30px]">
                {news.map((newsItem) => (
                    <NewsCard key={newsItem.id} news={newsItem} />
                ))}
            </div>
            
            {renderPagination()}
            
            {loading && news.length > 0 && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            )}
        </div>
    );
}
