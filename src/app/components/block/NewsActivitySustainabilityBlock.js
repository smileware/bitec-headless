'use client';

import React, { useState } from 'react';
import NewsCard from '../ui/NewsCard';
import { useNewsActivitySustainability } from '../../hooks/useBlockQueries';

export default function NewsActivitySustainabilityBlock(props) {
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isFetching } = useNewsActivitySustainability(currentPage, 6);
    const news = data?.content || [];
    const pageInfo = data?.pageInfo;
    const hasNextPage = !!pageInfo?.hasNextPage;
    // Preserve prior pagination heuristic when offset total is absent
    const totalPages = pageInfo?.offsetPagination?.total
        ? Math.ceil(pageInfo.offsetPagination.total / 6)
        : hasNextPage
            ? currentPage + 1
            : Math.max(currentPage, 1);
    const loading = isLoading || (isFetching && news.length === 0);
    const showOverlaySpinner = isFetching && news.length > 0;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (totalPages <= 1 && !hasNextPage) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

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
                    {[...Array(6)].map((_, index) => (
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

            {showOverlaySpinner && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            )}
        </div>
    );
}
