'use client';

import { useState, useEffect } from 'react';
import { useTabAccordion } from '../../hooks/useBlockQueries';
import Skeleton from '../ui/Skeleton';

export default function TabAccordionBlock(props) {
    const [activeTab, setActiveTab] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    
    // Use React Query hook - automatically caches and deduplicates requests
    const { data: tabData, isLoading: loading, error } = useTabAccordion('plan-and-event');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1025);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading) {
        return (
            <div className="">
                {/* Mobile skeleton */}
                <div className="block lg:hidden space-y-4 py-[40px] px-[20px]">
                    <Skeleton className="h-[47px] w-full mb-[20px]" /> {/* Title skeleton */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-[#DE5E72] overflow-hidden mb-0">
                            <div className="w-full py-[20px] flex items-center justify-between">
                                <Skeleton className="h-[24px] w-3/4" />
                                <Skeleton className="w-[26px] h-[26px] rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Desktop skeleton */}
                <div className="hidden lg:flex flex-col lg:flex-row">
                    {/* Left column skeleton */}
                    <div className="space-y-6 lg:w-[calc(50%-100px)] lg:pr-8 lg:pl-[calc((100vw-1380px+30px)/2)] py-[100px]">
                        <Skeleton className="h-[80px] w-full mb-[40px]" /> {/* Title skeleton */}
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-full px-[20px] py-[3px] flex items-center justify-between">
                                    <Skeleton className="h-[30px] w-3/4" />
                                    <Skeleton className="w-[16px] h-[16px] rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right column skeleton */}
                    <div className="min-h-[400px] flex items-center lg:w-[calc(50%+100px)] lg:pl-8">
                        <Skeleton className="w-full h-[400px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading tab content: {error.message}
                </div>
            </div>
        );
    }

    if (!tabData || !tabData.tabs || tabData.tabs.length === 0) {
        return null;
    }

    return (
        <div className="">
            {isMobile ? (
                // Accordion view for mobile
                <div className="space-y-4 py-[40px] px-[20px]">
                    {tabData.title && (
                        <h2 className="text-white text-[39px] font-medium leading-[1.2] mb-[20px]">
                            {tabData.title}
                        </h2>
                    )}
                    {tabData.tabs.map((tab, index) => (
                        <div key={index} className="border-b border-[#DE5E72] overflow-hidden mb-0">
                            <button
                                onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                                className="w-full py-[20px] text-left flex items-center justify-between"
                            >
                                <span className="font-medium text-white text-[24px] leading-[1]">{tab.tabButton}</span>
                                {activeTab === index ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash text-white w-[26px] h-[26px]" viewBox="0 0 16 16">
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus text-white w-[26px] h-[26px]" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                    </svg>
                                )}
                            </button>
                            {activeTab === index && (
                                <div className="">
                                    {tab.tabImage && (
                                        <img
                                            src={tab.tabImage}
                                            alt={tab.altText || tab.tabButton}
                                            className="w-full h-auto mb-[20px] min-h-[268px] max-h-[268px] object-cover"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Two-column layout for desktop
                <div className="flex flex-col lg:flex-row">
                    {/* Left column - Title and vertical tabs */}
                    <div className="space-y-6 lg:w-[calc(50%-100px)] lg:pr-8 lg:pl-[calc((100vw-1380px+30px)/2)] py-[30px] flex flex-col justify-center" >
                        {tabData.title && (
                            <h2 className="text-white text-[67px] font-bold leading-[1.2] mb-[40px]">
                                {tabData.title}
                            </h2>
                        )}
                        
                        {/* Vertical tab buttons */}
                        <div className="space-y-2">
                            {tabData.tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`w-full text-left px-[20px] py-[3px] text-[30px] font-normal transition-all duration-200 flex items-center justify-between text-white rounded-[5px] cursor-pointer ${
                                        activeTab === index
                                            ? 'bg-[#BB0D29]'
                                            : 'hover:bg-[#BB0D29]'
                                    }`}
                                >
                                    {tab.tabButton}

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right column - Tab content */}
                    <div className="min-h-[588px] max-h-[588px] flex items-center lg:w-[calc(50%+100px)] lg:pl-8">
                        {tabData.tabs[activeTab] && (
                            <div className="w-full h-full">
                                {tabData.tabs[activeTab].tabImage && (
                                    <img
                                        src={tabData.tabs[activeTab].tabImage}
                                        alt={tabData.tabs[activeTab].altText || tabData.tabs[activeTab].tabButton}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}