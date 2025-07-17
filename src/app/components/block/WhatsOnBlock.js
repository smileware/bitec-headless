'use client';

import { useEffect, useState } from 'react';
import EventCard from '../ui/EventCard';
import Skeleton from '../ui/Skeleton';
import { getFilteredEvents, getAllEventCategories, getAllEventYears } from '../../lib/event';
import { usePathname } from 'next/navigation';

export default function WhatsOnBlock(props) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [categories, setCategories] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [filters, setFilters] = useState({
        categoryId: null,
        eventType: 'upcoming',
        month: null,
        year: null
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalEvents, setTotalEvents] = useState(0);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        categoryId: null,
        eventType: 'upcoming',
        month: null,
        year: null
    });
    
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

    // Generate month options
    const monthOptions = [
        { value: null, label: currentLang === 'th' ? 'ทุกเดือน' : 'ALL MONTHS' },
        { value: 1, label: 'JAN' },
        { value: 2, label: 'FEB' },
        { value: 3, label: 'MAR' },
        { value: 4, label: 'APR' },
        { value: 5, label: 'MAY' },
        { value: 6, label: 'JUN' },
        { value: 7, label: 'JUL' },
        { value: 8, label: 'AUG' },
        { value: 9, label: 'SEP' },
        { value: 10, label: 'OCT' },
        { value: 11, label: 'NOV' },
        { value: 12, label: 'DEC' }
    ];

    // Generate year options from available years
    const yearOptions = [
        { value: null, label: currentLang === 'th' ? 'ทุกปี' : 'ALL YEARS' },
        ...availableYears.map(year => ({
            value: year,
            label: year.toString()
        }))
    ];

    useEffect(() => {
        // Check if mobile on mount and resize
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1023); // md breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [categoriesData, yearsData] = await Promise.all([
                    getAllEventCategories(),
                    getAllEventYears()
                ]);
                setCategories(categoriesData);
                setAvailableYears(yearsData);
                
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        }

        fetchInitialData();
    }, []);

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                const perPage = isMobile ? 6 : 12; // 6 for mobile, 12 for desktop
                const result = await getFilteredEvents({
                    ...filters,
                    page: 1,
                    perPage: perPage
                });
                setEvents(result.events);
                setHasMore(result.hasMore);
                setTotalEvents(result.total);
                setPage(1);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [filters, isMobile]);

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;
        
        setLoadingMore(true);
        console.log('Loading more events... Current page:', page, 'Current events:', events.length);
        
        try {
            const nextPage = page + 1;
            const perPage = isMobile ? 6 : 12; // 6 for mobile, 12 for desktop
            const result = await getFilteredEvents({
                ...filters,
                page: nextPage,
                perPage: perPage
            });
            
            
            // Simply append the new events
            setEvents(prev => {
                const updatedEvents = [...prev, ...result.events];
                console.log('Updated events total:', updatedEvents.length);
                return updatedEvents;
            });
            setHasMore(result.hasMore);
            setPage(nextPage);
        } catch (error) {
            console.error('Error loading more events:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const openFilterModal = () => {
        setTempFilters(filters);
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const applyFilters = () => {
        setFilters(tempFilters);
        setIsFilterModalOpen(false);
    };

    const handleTempFilterChange = (filterType, value) => {
        setTempFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Mobile Filter Modal
    const MobileFilterModal = () => {
        if (!isFilterModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/90 z-999 flex items-center p-[20px]">
                <div className="bg-white w-full max-h-[100vh] overflow-hidden px-[15px] py-[20px]">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[22px] font-normal text-[#000]">
                            {currentLang === 'th' ? 'ตัวกรอง' : 'Filters'}
                        </h3>
                        <button
                            onClick={closeFilterModal}
                            className="text-[var(--s-accent)]"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Category Filter */}
                        <div>
                            <h4 className="text-[25px] font-medium text-[#000] mb-2">
                                {currentLang === 'th' ? 'หมวดหมู่' : 'Category'}
                            </h4>
                            <div className="flex flex-wrap gap-[10px] items-center">
                                <button
                                    onClick={() => handleTempFilterChange('categoryId', null)}
                                    className={`cursor-pointer px-[20px] py-0 text-[22px] font-normal rounded-full transition-colors duration-200 border border-[#DDDDDE] ${
                                        tempFilters.categoryId === null
                                            ? 'bg-[var(--s-accent)] text-white border-[var(--s-accent)]'
                                            : 'bg-transparent text-[#3D3D3F]'
                                    }`}
                                >
                                    {currentLang === 'th' ? 'ทั้งหมด' : 'All'}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleTempFilterChange('categoryId', category.id)}
                                        className={`cursor-pointer px-[20px] py-0 text-[22px] font-normal rounded-full transition-colors duration-200 border border-[#DDDDDE] ${
                                            tempFilters.categoryId === category.id
                                                ? 'bg-[var(--s-accent)] text-white border-[var(--s-accent)]'
                                                : 'bg-transparent text-[#3D3D3F]'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Event Type Filter */}
                        <div>
                            <h4 className="text-[25px] font-medium text-[#000] mb-2">
                                {currentLang === 'th' ? 'สถานะ' : 'Status'}
                            </h4>
                            <div className="space-y-1 flex flex-col">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="eventType"
                                        checked={tempFilters.eventType === 'upcoming'}
                                        onChange={() => handleTempFilterChange('eventType', 'upcoming')}
                                        className="absolute opacity-0"
                                    />
                                    <span className={`mr-3 relative inline-block w-6 h-6 border rounded-full before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-[15px] before:h-[15px] before:bg-[var(--s-accent)] before:rounded-full before:opacity-0 before:transition-opacity before:duration-200 ${
                                        tempFilters.eventType === 'upcoming' 
                                            ? 'bg-[var(--s-accent)] border-[var(--s-accent)] shadow-[inset_0_0_0_4px_white]' 
                                            : 'bg-transparent border-[#CCCCCE]'
                                    }`}></span>
                                    <span className="text-[22px] text-[#3D3D3F]">
                                        {currentLang === 'th' ? 'กิจกรรมที่กำลังเกิดขึ้นและกำลังจะมาถึง' : 'Happening & Upcoming Events'}
                                    </span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="eventType"
                                        checked={tempFilters.eventType === 'past'}
                                        onChange={() => handleTempFilterChange('eventType', 'past')}
                                        className="absolute opacity-0"
                                    />
                                    <span className={`mr-3 relative inline-block w-6 h-6 border rounded-full before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-[15px] before:h-[15px] before:bg-[var(--s-accent)] before:rounded-full before:opacity-0 before:transition-opacity before:duration-200 ${
                                        tempFilters.eventType === 'past' 
                                            ? 'bg-[var(--s-accent)] border-[var(--s-accent)] shadow-[inset_0_0_0_4px_white]' 
                                            : 'bg-transparent border-[#CCCCCE]'
                                    }`}></span>
                                    <span className="text-[22px] text-[#3D3D3F]">
                                        {currentLang === 'th' ? 'กิจกรรมที่ผ่านมาแล้ว' : 'Past Events'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <h4 className="text-[25px] font-medium text-[#000] mb-2">
                                {currentLang === 'th' ? 'วันเดือนปี' : 'Date'}
                            </h4>
                            <div className='flex items-center gap-[10px]'>
                                <select
                                    value={tempFilters.month || ''}
                                    onChange={(e) => handleTempFilterChange('month', e.target.value ? parseInt(e.target.value) : null)}
                                     className="w-full px-[5px] border border-[var(--s-accent)] font-normal text-[var(--s-accent)] w-[100px] h-[34px] text-[22px]"
                                >
                                    {monthOptions.map((option) => (
                                        <option key={option.value} value={option.value || ''}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={tempFilters.year || ''}
                                    onChange={(e) => handleTempFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-[5px] border border-[var(--s-accent)] font-normal text-[var(--s-accent)] w-[100px] h-[34px] text-[22px]"
                                >
                                    {yearOptions.map((option) => (
                                        <option key={option.value} value={option.value || ''}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex mt-[30px]">
                        <button
                            onClick={applyFilters}
                            className="flex-1 py-[5px] px-4 bg-[var(--s-accent)] text-white rounded-0 text-[22px]"
                        >
                            {currentLang === 'th' ? 'ใช้' : 'APPLY'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const FilterSection = () => (
        <div className="my-[20px] mb-[40px]">
            <div className="flex gap-6 justify-between">

                {/* Category Filter */}
                <div className="flex items-center">
                    <div className="min-w-[90px] flex-1 items-center flex text-[#636363] text-[18px] font-400 mr-[20px]">
                        {currentLang === 'th' ? 'EVENT FILTER:' : 'EVENT FILTER:'}
                    </div>
                    <div className="flex flex-wrap gap-[8px] items-center">
                        <button
                            onClick={() => handleFilterChange('categoryId', null)}
                            className={`cursor-pointer px-[20px] py-[1px] text-[18px] text-[#3D3D3F] font-normal transition-colors duration-200 bg-white text-[#3D3D3F] rounded-full hover:text-white ${
                                filters.categoryId === null
                                    ? '!bg-[var(--s-accent)] text-white'
                                    : 'text-[#3D3D3F] hover:bg-[var(--s-accent-hover)]'
                            }`}
                        >
                            {currentLang === 'th' ? 'ทั้งหมด' : 'All'}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleFilterChange('categoryId', category.id)}
                                className={`cursor-pointer px-[20px] py-[1px] text-[18px] text-[#3D3D3F] font-normal transition-colors duration-200 bg-white text-[#3D3D3F] rounded-full hover:text-white ${
                                    filters.categoryId === category.id
                                        ? '!bg-[var(--s-accent)] text-white'
                                        : 'text-[#3D3D3F] hover:bg-[var(--s-accent-hover)]'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-[10px]">
                    {/* Event Type Filter */}
                    <div className="flex items-center mr-[10px]">
                        <div className="text-[18px] font-normal text-[#919195]">
                            <button
                                onClick={() => handleFilterChange('eventType', 'upcoming')}
                                className={`transition-colors duration-200 cursor-pointer ${
                                    filters.eventType === 'upcoming'
                                        ? 'text-[var(--s-accent)]'
                                        : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                                }`}
                            >
                                {currentLang === 'th' ? 'กิจกรรมที่กำลังเกิดขึ้นและกำลังจะมาถึง' : 'Happening & Upcoming Events'}
                            </button>
                            <span className="mx-2 text-[#CCCCCE]">|</span>
                            <button
                                onClick={() => handleFilterChange('eventType', 'past')}
                                className={`transition-colors duration-200 cursor-pointer ${
                                    filters.eventType === 'past'
                                        ? 'text-[var(--s-accent)]'
                                        : 'text-[#919195] hover:text-[var(--s-accent-hover)]'
                                }`}
                            >
                                {currentLang === 'th' ? 'กิจกรรมที่ผ่านมาแล้ว' : 'Past Events'}
                            </button>
                        </div>
                    </div>

                

                    {/* Month Filter */}
                    <div className="flex items-center">
                        <select
                            value={filters.month || ''}
                            onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-[5px] border-1 border-[var(--s-accent)] font-normarl text-[var(--s-accent)] w-[100px] h-[34px]"
                        >
                            {monthOptions.map((option) => (
                                <option key={option.value} value={option.value || ''}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="filter-group">
                        <select
                            value={filters.year || ''}
                            onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-[5px] border-1 border-[var(--s-accent)] font-normarl text-[var(--s-accent)] w-[100px] h-[34px]"
                        >
                            {yearOptions.map((option) => (
                                <option key={option.value} value={option.value || ''}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const EventsGrid = () => (
        <div className="events-grid">
            {loading ? (
                // Loading skeleton
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-[16px]">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="bg-white overflow-hidden">
                            <div className="p-6">
                                <Skeleton className="w-full h-[400px]"/>
                            </div>
                            <div className="p-6">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-6 w-full mb-4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length > 0 ? (
                <>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-[16px]">
                        {events.map((event, index) => (
                            <EventCard key={`${event.id}-${index}`} event={event} />
                        ))}
                    </div>
                    
                    {hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className={`font-normal text-[22px] py-[4px] px-[30px] rounded-0 transition-colors duration-200 ${
                                    loadingMore 
                                        ? 'bg-[#CCCCCE] text-[#919195] cursor-not-allowed' 
                                        : 'bg-transparent border border-[var(--s-accent)] hover:bg-[var(--s-accent-hover)]) text-[var(--s-accent)] cursor-pointer'
                                }`}
                            >
                                {loadingMore ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {currentLang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                                    </span>
                                ) : (
                                    currentLang === 'th' ? 'โหลดเพิ่มเติม' : 'LOAD MORE'
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {currentLang === 'th' ? 'ไม่พบกิจกรรมที่ตรงกับเงื่อนไขการค้นหา' : 'NOT FOUND'}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <section className="whats-on-section">
            <div className="mb-5">
                <div className="_desktop">
                    <FilterSection />
                </div>
                <div className="_mobile flex justify-between items-center gap-[20px] mb-[20px]">
                    <div className="text-[24px] font-medium text-[#000]">EVENT</div>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-0 border border-[var(--s-accent)] rounded-0 text-[20px] text-[var(--s-accent)] font-medium"
                        onClick={openFilterModal}
                    >
                        <span>FILTER</span>
                        <span>
                            <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 0.957214H0V2.45721H16V0.957214Z" fill="#CE0E2D"/>
                                <path d="M13 6.20721H3V7.70721H13V6.20721Z" fill="#CE0E2D"/>
                                <path d="M10.5 11.2072H5.5V12.7072H10.5V11.2072Z" fill="#CE0E2D"/>
                            </svg>
                        </span>
                    </button>
                </div>
                <EventsGrid />
            </div>
            <MobileFilterModal />
        </section>
    );
}