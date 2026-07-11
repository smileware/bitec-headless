'use client';

import React, { useState } from 'react';
import NewsCard from '../ui/NewsCard';
import { useNewsActivity } from '../../hooks/useBlockQueries';

export default function NewsActivityBlock(props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState('news');

    const { data, isLoading, isFetching } = useNewsActivity(currentPage, activeFilter, 9);
    const news = data?.content || [];
    const totalPages = data?.pageInfo?.offsetPagination?.total
        ? Math.ceil(data.pageInfo.offsetPagination.total / 9)
        : 0;
    const loading = isLoading || (isFetching && news.length === 0);
    const showOverlaySpinner = isFetching && news.length > 0;

    const handleFilterChange = (filter) => {
        if (filter === activeFilter) return;
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];

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
        pages.push(
            <button
                key={1}
                onClick={() => handlePageChange(1)}
                className={`theme-pagination${currentPage === 1 ? ' active' : ''}`}
            >
                1
            </button>
        );
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (startPage > 2) {
            pages.push(<span key="start-ellipsis" className="px-2">…</span>);
        }

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

        if (endPage < totalPages - 1) {
            pages.push(<span key="end-ellipsis" className="px-2">…</span>);
        }

        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`theme-pagination${currentPage === totalPages ? ' active' : ''}`}
                >
                    {totalPages}
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
                <div className="flex justify-end mb-[30px]">
                    <div className="text-[18px] font-normal text-[#919195] min-w-max">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('news')}
                            className={`transition-colors duration-200 cursor-pointer ${
                                activeFilter === 'news'
                                    ? 'text-[var(--s-accent)]'
                                    : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                            }`}
                        >
                            News and Activities
                        </button>
                        <span className="mx-2 text-[#CCCCCE]">|</span>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('blog')}
                            className={`transition-colors duration-200 cursor-pointer ${
                                activeFilter === 'blog'
                                    ? 'text-[var(--s-accent)]'
                                    : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                            }`}
                        >
                            Blog
                        </button>
                    </div>
                </div>
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
            <div className="flex justify-end mb-[30px]">
                <div className="text-[18px] font-normal text-[#919195] min-w-max">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('news')}
                        className={`transition-colors duration-200 cursor-pointer ${
                            activeFilter === 'news'
                                ? 'text-[var(--s-accent)]'
                                : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                        }`}
                    >
                        News and Activities
                    </button>
                    <span className="mx-2 text-[#CCCCCE]">|</span>
                    <button
                        type="button"
                        onClick={() => handleFilterChange('blog')}
                        className={`transition-colors duration-200 cursor-pointer ${
                            activeFilter === 'blog'
                                ? 'text-[var(--s-accent)]'
                                : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                        }`}
                    >
                        Blog
                    </button>
                </div>
            </div>

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
