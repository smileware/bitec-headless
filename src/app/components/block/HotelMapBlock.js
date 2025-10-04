'use client';

import { useState, useEffect, useRef } from 'react';
import { GetAllHotels, GetAllCategories } from '@/app/lib/block';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HotelMapBlock(props) {
    const pathname = usePathname();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hotelsPerPage] = useState(4);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [categories, setCategories] = useState([]);

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

    // Mobile and tablet detection
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategories]);

        // Custom pin SVG
    const CustomPinSVG = () => (
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.00065 0.333252C4.48565 0.333252 0.833984 3.98492 0.833984 8.49992C0.833984 14.6249 9.00065 23.6666 9.00065 23.6666C9.00065 23.6666 17.1673 14.6249 17.1673 8.49992C17.1673 3.98492 13.5157 0.333252 9.00065 0.333252ZM9.00065 11.4166C7.39065 11.4166 6.08398 10.1099 6.08398 8.49992C6.08398 6.88992 7.39065 5.58325 9.00065 5.58325C10.6107 5.58325 11.9173 6.88992 11.9173 8.49992C11.9173 10.1099 10.6107 11.4166 9.00065 11.4166Z" fill="#CE0E2D"/>
        </svg>
    );

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const isTH = (pathname.split('/').filter(Boolean)[0] === 'th');
                
                const hotelsData = await GetAllHotels(isTH);
                const cats = await GetAllCategories(isTH);
                setCategories(cats);

                // Filter hotels that have coordinates (ACF fields are strings)
                const hotelsWithCoords = hotelsData.filter(hotel => 
                    hotel.hotelDetail?.latitude && 
                    hotel.hotelDetail?.longitude && 
                    hotel.hotelDetail.latitude !== '' && 
                    hotel.hotelDetail.longitude !== ''
                );
                
                setHotels(hotelsWithCoords);
                
                if (hotelsWithCoords.length > 0) {
                    setSelectedHotel(hotelsWithCoords[0]);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    useEffect(() => {
        if (hotels.length > 0 && !isMobile) {
            loadGoogleMapsAPI();
        }
    }, [hotels, isMobile]);

    // Update map markers when filters change
    useEffect(() => {
        if (mapInstanceRef.current && hotels.length > 0 && !isMobile) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Recreate markers with filtered hotels
            const filteredHotels = getFilteredHotels();
            filteredHotels.forEach((hotel, index) => {
                createCustomMarker(hotel, index, mapInstanceRef.current);
            });

            // Re-add BITEC marker
            createFixedBitecMarker(mapInstanceRef.current);
        }
    }, [searchTerm, selectedCategories, isMobile]);

    const loadGoogleMapsAPI = () => {
        if (window.google && window.google.maps) {
            initializeMap();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
    };

    const initializeMap = () => {
        if (!window.google || !mapRef.current || hotels.length === 0) return;

        const center = getMapCenter();
        
        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: center.lat, lng: center.lng },
            zoom: hotels.length > 1 ? 12 : 17,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        });

        mapInstanceRef.current = map;

        // Create custom markers for filtered hotels
        const filteredHotels = getFilteredHotels();
        filteredHotels.forEach((hotel, index) => {
            createCustomMarker(hotel, index, map);
        });

        // Add fixed BITEC logo marker
        createFixedBitecMarker(map);

        setMapLoaded(true);
    };

    const createCustomMarker = (hotel, index, map) => {
        // Check if hotel has 'recommended' category
        const isRecommended = hotel.hotelCategories?.nodes?.some(category => 
            category.slug.toLowerCase() === 'recommend' ||
            category.slug.toLowerCase() === 'recommend-th' 
        );

        // Choose SVG based on recommendation status
        const svgContent = isRecommended ? `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_2060_2879)">
                    <g clip-path="url(#clip1_2060_2879)">
                        <path d="M24 4C16.26 4 10 10.26 10 18C10 28.5 24 44 24 44C24 44 38 28.5 38 18C38 10.26 31.74 4 24 4ZM24 23C21.24 23 19 20.76 19 18C19 15.24 21.24 13 24 13C26.76 13 29 15.24 29 18C29 20.76 26.76 23 24 23Z" fill="#CE0E2D"/>
                    </g>
                </g>
                <rect x="15" y="9" width="18" height="18" rx="9" fill="white"/>
                <g clip-path="url(#clip2_2060_2879)">
                    <rect x="17" y="11" width="14" height="14" rx="7" fill="white"/>
                    <g clip-path="url(#clip3_2060_2879)">
                        <path d="M25.4168 16.8334L23.9993 12.1667L22.5818 16.8334H18.166L21.771 19.4059L20.4002 23.8334L23.9993 21.0976L27.6044 23.8334L26.2335 19.4059L29.8327 16.8334H25.4168Z" fill="#CE0E2D"/>
                    </g>
                </g>
                <defs>
                    <clipPath id="clip0_2060_2879">
                        <rect width="48" height="48" fill="white"/>
                    </clipPath>
                    <clipPath id="clip1_2060_2879">
                        <rect width="48" height="48" fill="white"/>
                    </clipPath>
                    <clipPath id="clip2_2060_2879">
                        <rect x="17" y="11" width="14" height="14" rx="7" fill="white"/>
                    </clipPath>
                    <clipPath id="clip3_2060_2879">
                        <rect width="14" height="14" fill="white" transform="translate(17 11)"/>
                    </clipPath>
                </defs>
            </svg>
        ` : `
            <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.00065 0.333252C4.48565 0.333252 0.833984 3.98492 0.833984 8.49992C0.833984 14.6249 9.00065 23.6666 9.00065 23.6666C9.00065 23.6666 17.1673 14.6249 17.1673 8.49992C17.1673 3.98492 13.5157 0.333252 9.00065 0.333252ZM9.00065 11.4166C7.39065 11.4166 6.08398 10.1099 6.08398 8.49992C6.08398 6.88992 7.39065 5.58325 9.00065 5.58325C10.6107 5.58325 11.9173 6.88992 11.9173 8.49992C11.9173 10.1099 10.6107 11.4166 9.00065 11.4166Z" fill="#CE0E2D"/>
            </svg>
        `;

        // Create custom marker with SVG
        const markerIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
            scaledSize: new window.google.maps.Size(
                isRecommended ? 48 : 24, 
                isRecommended ? 48 : 32
            ),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(
                isRecommended ? 24 : 12, 
                isRecommended ? 48 : 32
            ) // Anchor at bottom center of pin
        };

        const marker = new window.google.maps.Marker({
            position: { 
                lat: parseFloat(hotel.hotelDetail.latitude) || 0, 
                lng: parseFloat(hotel.hotelDetail.longitude) || 0
            },
            map: map,
            icon: markerIcon,
            title: hotel.title,
            animation: window.google.maps.Animation.DROP
        });

        // Check if hotel has "Recommend" category
        const hasRecommendCategory = hotel.hotelCategories?.nodes?.some(category => {
            const name = (category.name || '').toLowerCase().trim();
            return name === 'highlight' || name === 'ไฮไลท์';
        });

        // Get hotel title and excerpt based on language
        const hotelTitle = currentLang === 'th'
            ? (hotel.translations && hotel.translations[0]?.title ? hotel.translations[0].title : hotel.title)
            : hotel.title;
        
        const hotelExcerpt = currentLang === 'th'
            ? (hotel.translations && hotel.translations[0]?.excerpt ? hotel.translations[0].excerpt : hotel.excerpt)
            : hotel.excerpt;

        const infoWindow = new window.google.maps.InfoWindow({
            content: `
                <a href="${currentLang === 'th' ? `/th/hotel/${hotel.translations && hotel.translations[0]?.slug ? hotel.translations[0].slug : hotel.slug}` : `/hotel/${hotel.slug}`}" style="color: #161616; text-decoration: none;">
                    <div style="background: white; border-radius: 0px; padding-left: 5px;  overflow: hidden; max-width: 300px;">
                        <div style="position: relative;">
                            <img src="${hotel.featuredImage?.node?.sourceUrl || '/img/thumb.jpg'}" 
                                alt="${hotel.featuredImage?.node?.altText || hotelTitle}" 
                                style="width: 100%; height: 200px; object-fit: cover;" />
                            ${hasRecommendCategory ? `
                            <div style="position: absolute; bottom: 20px; left: 20px; background: #CE0E2D; color: white; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 400; display: flex; align-items: center; gap: 10px;">
                                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.61967 6.16683L6.99967 0.833496L5.37967 6.16683H0.333008L4.45301 9.10683L2.88634 14.1668L6.99967 11.0402L11.1197 14.1668L9.55301 9.10683L13.6663 6.16683H8.61967Z" fill="white"/>
                                </svg>
                                Recommend
                            </div>
                            ` : ''}
                        </div>
                        <div style="padding: 20px 0;">
                            <h2 style="margin: 0 0 10px 0; color: #161616; font-size: 20px; font-weight: 500; line-height: 1.2;">
                                ${hotelTitle}
                            </h2>
                            ${hotelExcerpt ? `
                            <div style="color: #454545; font-size: 16px; font-weight: 400; line-height: 1.6; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                ${hotelExcerpt.replace(/<[^>]*>/g, '')}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </a>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
            setSelectedHotel(hotel);
        });

        markersRef.current.push(marker);
    };

    const createFixedBitecMarker = (map) => {
        // Fixed BITEC coordinates
        const bitecPosition = { 
            lat: 13.669833010553885, 
            lng: 100.61026916715934 
        };

        // Create custom marker icon for BITEC logo
        const bitecIcon = {
            url: '/img/bitec-logo-square.png',
            scaledSize: new window.google.maps.Size(55, 55),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(27.5, 27.5) // Center the 55x55 image
        };

        // Create fixed BITEC marker (non-interactive)
        const bitecMarker = new window.google.maps.Marker({
            position: bitecPosition,
            map: map,
            icon: bitecIcon,
            title: 'BITEC',
            clickable: false, // Make it non-interactive
            zIndex: 1000 // Ensure it appears above other markers
        });

        markersRef.current.push(bitecMarker);
    };

    // // Get unique categories from all hotels
    // const getAllCategories = () => {
    //     const categories = new Set();
    //     hotels.forEach(hotel => {
    //         hotel.hotelCategories?.nodes?.forEach(category => {
    //             categories.add(JSON.stringify({ id: category.id, name: category.name, slug: category.slug }));
    //         });
    //     });
    //     return Array.from(categories).map(cat => JSON.parse(cat));
    // };

    // Filter hotels based on search and categories
    // const getFilteredHotels = () => {
    //     return hotels.filter(hotel => {
    //         // Search filter
    //         const matchesSearch = searchTerm === '' || 
    //             hotel.title.toLowerCase().includes(searchTerm.toLowerCase());

    //         // Category filter
    //         const matchesCategory = selectedCategories.length === 0 || 
    //             hotel.hotelCategories?.nodes?.some(category => 
    //                 selectedCategories.includes(category.id)
    //             );

    //         return matchesSearch && matchesCategory;
    //     });
    // };
    const getFilteredHotels = () => {

        // category order map: lower = earlier in your taxonomy order
        const catRank = Object.fromEntries(categories.map((c, i) => [c.id, i]));
        const rankOf = (h) => {
          const ranks = h.hotelCategories?.nodes?.map(c => catRank[c.id]).filter(r => r !== undefined) || [];
          return ranks.length ? Math.min(...ranks) : Number.POSITIVE_INFINITY; // no cat -> last
        };

        const filtered = hotels.filter(hotel => {
          const matchesSearch =
            !searchTerm || hotel.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategories.length === 0 ||
            hotel.hotelCategories?.nodes?.some(c => selectedCategories.includes(c.id));
          return matchesSearch && matchesCategory;
        });
      
        // sort by category order, then by date DESC
        return filtered.sort((a, b) => {
          const ra = rankOf(a), rb = rankOf(b);
          if (ra !== rb) return ra - rb;
          return new Date(b.date) - new Date(a.date);
        });
    };

    // Pagination functions
    const getPaginatedHotels = () => {
        const filteredHotels = getFilteredHotels();
        const indexOfLastHotel = currentPage * hotelsPerPage;
        const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
        return filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
    };

    const totalPages = Math.ceil(getFilteredHotels().length / hotelsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const getMapCenter = () => {
        if (hotels.length === 0) return { lat: 13.6696558, lng: 100.609722 };
        
        const totalLat = hotels.reduce((sum, hotel) => sum + parseFloat(hotel.hotelDetail.latitude), 0);
        const totalLng = hotels.reduce((sum, hotel) => sum + parseFloat(hotel.hotelDetail.longitude), 0);
        
        return {
            lat: totalLat / hotels.length,
            lng: totalLng / hotels.length
        };
    };

    const handleHotelSelect = (hotel) => {
        setSelectedHotel(hotel);
        
        if (mapInstanceRef.current) {
            const position = { 
                lat: parseFloat(hotel.hotelDetail.latitude) || 0, 
                lng: parseFloat(hotel.hotelDetail.longitude) || 0
            };
            mapInstanceRef.current.panTo(position);
            mapInstanceRef.current.setZoom(17);
        }
    };

    if (loading) {
        return (
            <div {...props} className="hotel-map-block">
                <div className="">
                    {!isMobile ? (
                        <div className="flex h-[776px]">
                            <div className="w-[55%] pr-4">
                                <div className="h-full bg-gray-200 flex items-center justify-center">
                                    <div className="text-gray-500">Loading hotels...</div>
                                </div>
                            </div>
                            <div className="w-[45%] pl-4">
                                <div className="h-full bg-gray-200 flex items-center justify-center">
                                    <div className="text-gray-500">Loading map...</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] bg-gray-200 flex items-center justify-center">
                            <div className="text-gray-500">Loading hotels...</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div {...props} className="hotel-map-block">
            <div className="">
                {/* Search and Filter Section */}
                <div className="mb-[30px]">
                    <div className="flex flex-col lg:flex-row gap-[30px] items-start lg:items-center">
                        {/* Search Field */}
                        <div className="min-w-0 lg:w-auto w-full">
                            <div className="relative">
                                <input
                                    name="hotel-search"
                                    type="text"
                                    placeholder="Enter a hotel name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full lg:max-w-[400px] max-w-full lg:min-w-[400px] min-w-full px-4 py-[4px] !pl-[44px] !rounded-none !border-none bg-white focus:ring-1 focus:ring-[var(--s-accent)] focus:border-transparent outline-none transition-colors text-[22px] font-normal"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[18px] h-[18px] text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-center items-start gap-2">
                                <label className="text-[20px] text-[#636363]">
                                    HOTEL FILTER:
                                </label>
                                <div className="flex flex-wrap gap-[10px]">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryToggle(category.id)}
                                            className={`px-[20px] py-[2px] rounded-full border-none transition-colors text-[18px] cursor-pointer ${
                                                selectedCategories.includes(category.id)
                                                    ? 'bg-[var(--s-accent)] text-white border-[var(--s-accent)]'
                                                    : 'bg-white text-[#3D3D3F] hover:text-[var(--s-accent)]'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${!isMobile ? 'flex h-[776px] gap-[15px]' : ''}`}>
                    {/* Hotel List - Left Side */}
                    <div className={`${!isMobile ? 'w-[55%] pr-4' : 'w-full'}`}>
                        <div className={`${!isMobile ? 'h-full overflow-y-auto hotel-list-container' : ''}`}>
                            <div className={`${!isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                                {(isMobile ? getPaginatedHotels() : getFilteredHotels()).map((hotel, index) => (
                                    <div 
                                        key={hotel.id}
                                        className={`${!isMobile ? `cursor-pointer transition-colors border-1 bg-white border-[transparent] hover:border-[var(--s-accent-hover)]` : ''}`}
                                        onClick={() => !isMobile ? handleHotelSelect(hotel) : null}
                                    >
                                        {!isMobile ? (
                                            <div className="flex">
                                                {/* Hotel Image */}
                                                <div className="flex-shrink-0">
                                                    {hotel.featuredImage?.node?.sourceUrl ? (
                                                        <div className="relative h-full">
                                                            <Image
                                                                src={hotel.featuredImage.node.sourceUrl}
                                                                alt={hotel.featuredImage.node.altText || hotel.title}
                                                                width={80}
                                                                height={80}
                                                                className="object-cover w-[207px] h-full"
                                                            />


                                                            {hotel.hotelCategories?.nodes?.some(({ name, slug }) => {
                                                                const n = (name || '').toLowerCase().trim();
                                                                const s = (slug || '').toLowerCase().trim();
                                                                return n === 'highlight' || n === 'ไฮไลท์' || s === 'highlight' || s === 'recommend' || s === 'recommend-th';
                                                            }) && (
                                                                <div className="absolute bottom-[20px] left-[20px] bg-[#CE0E2D] text-white px-[20px] py-[2px] rounded-full text-[16px] font-[400] flex items-center gap-[10px]">
                                                                     <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M8.61967 6.16683L6.99967 0.833496L5.37967 6.16683H0.333008L4.45301 9.10683L2.88634 14.1668L6.99967 11.0402L11.1197 14.1668L9.55301 9.10683L13.6663 6.16683H8.61967Z" fill="white"/>
                                                                    </svg>
                                                                    {currentLang === 'th' ? 'ไฮไลท์' : 'Highlight'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className=" w-[207px] h-full bg-gray-200 flex items-center justify-center">
                                                            <CustomPinSVG />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Hotel Info */}
                                                <div className="flex-1 min-w-0 py-[20px] px-[30px]">
                                                    <h3 className="font-semibold text-[#161616] text-[24px] mb-[6px]">
                                                        {hotel.title}
                                                    </h3>
                                                    {hotel.excerpt && (
                                                        <div 
                                                            className="text-[18px] leading-[1.2] text-[#454545] line-clamp-3"
                                                            dangerouslySetInnerHTML={{ __html: hotel.excerpt }}
                                                        />
                                                    )}
                                                    <div className="flex gap-[20px] mt-[15px]">
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
                                            </div>
                                        ) : (
                                            // Mobile/Tablet Hotel Card Layout
                                            <article className="bg-white h-full">
                                                <div className="pic relative">
                                                    <Link
                                                        href={
                                                            currentLang === 'th'
                                                                ? `/th/hotel/${hotel.translations && hotel.translations[0]?.slug ? hotel.translations[0].slug : hotel.slug}`
                                                                : `/hotel/${hotel.slug}`
                                                        }
                                                        title={`Permalink to ${currentLang === 'th'
                                                            ? (hotel.translations && hotel.translations[0]?.title ? hotel.translations[0].title : hotel.title)
                                                            : hotel.title
                                                        }`}
                                                    >
                                                        <Image
                                                            src={hotel.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                                                            alt={hotel.featuredImage?.node?.altText || hotel.title}
                                                            width={400}
                                                            height={180}
                                                            className="w-full h-auto object-cover min-h-[180px] max-h-[180px]"
                                                        />
                                                    </Link>



                                                    {hotel.hotelCategories?.nodes?.some(({ name, slug }) => {
                                                        const n = (name || '').toLowerCase().trim();
                                                        const s = (slug || '').toLowerCase().trim();
                                                        return n === 'highlight' || n === 'ไฮไลท์' || s === 'highlight' || s === 'recommend' || s === 'recommend-th';
                                                    }) && (
                                                        <div className="absolute top-[20px] lg:right-[30px] right-[20px] bg-[#CE0E2D] text-white px-[20px] py-[2px] rounded-full text-[16px] font-[400] flex items-center gap-[10px]">
                                                            <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8.61967 6.16683L6.99967 0.833496L5.37967 6.16683H0.333008L4.45301 9.10683L2.88634 14.1668L6.99967 11.0402L11.1197 14.1668L9.55301 9.10683L13.6663 6.16683H8.61967Z" fill="white"/>
                                                            </svg>
                                                            {currentLang === 'th' ? 'ไฮไลท์' : 'Highlight'}
                                                        </div>
                                                    )}
{/* 
                                                    {hotel.hotelCategories?.nodes?.some(category => 
                                                        category.name?.toLowerCase() === 'highlight'
                                                    ) && (
                                                        <div className="absolute top-[20px] lg:right-[30px] right-[20px] bg-[#CE0E2D] text-white px-[20px] py-[2px] rounded-full text-[16px] font-[400] flex items-center gap-[10px]">
                                                            <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8.61967 6.16683L6.99967 0.833496L5.37967 6.16683H0.333008L4.45301 9.10683L2.88634 14.1668L6.99967 11.0402L11.1197 14.1668L9.55301 9.10683L13.6663 6.16683H8.61967Z" fill="white"/>
                                                            </svg>
                                                            Highlight
                                                        </div>
                                                    )} */}
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
                                                                className="text-[#454545] lg:text-[25px] text-[20px] font-[400] leading-[1.4] line-clamp-3 mb-[10px]"
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
                                                            <div className="flex gap-[8px] items-center text-[#3D3D3F] text-[18px]">
                                                                <svg className="w-[16px] h-[16px]" width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M4.99967 0.833496C2.41967 0.833496 0.333008 2.92016 0.333008 5.50016C0.333008 9.00016 4.99967 14.1668 4.99967 14.1668C4.99967 14.1668 9.66634 9.00016 9.66634 5.50016C9.66634 2.92016 7.57967 0.833496 4.99967 0.833496ZM4.99967 7.16683C4.07967 7.16683 3.33301 6.42016 3.33301 5.50016C3.33301 4.58016 4.07967 3.8335 4.99967 3.8335C5.91967 3.8335 6.66634 4.58016 6.66634 5.50016C6.66634 6.42016 5.91967 7.16683 4.99967 7.16683Z" fill="#CE0E2D"/>
                                                                </svg>

                                                                {hotel.hotelDetail.hotelShortAddress}
                                                            </div>
                                                        )}
                                                        {hotel.hotelDetail.hotelTransportation?.length > 0 && (
                                                            <div className="flex gap-[8px] items-center text-[#3D3D3F] text-[18px]">
                                                                <svg className="w-[16px] h-[16px]" width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M6.00033 0.833496C3.33366 0.833496 0.666992 1.16683 0.666992 3.50016V9.8335C0.666992 11.1202 1.71366 12.1668 3.00033 12.1668L2.00033 13.1668V13.5002H3.48699L4.82032 12.1668H7.33366L8.66699 13.5002H10.0003V13.1668L9.00033 12.1668C10.287 12.1668 11.3337 11.1202 11.3337 9.8335V3.50016C11.3337 1.16683 8.94699 0.833496 6.00033 0.833496ZM3.00033 10.8335C2.44699 10.8335 2.00033 10.3868 2.00033 9.8335C2.00033 9.28016 2.44699 8.8335 3.00033 8.8335C3.55366 8.8335 4.00033 9.28016 4.00033 9.8335C4.00033 10.3868 3.55366 10.8335 3.00033 10.8335ZM5.33366 6.16683H2.00033V3.50016H5.33366V6.16683ZM6.66699 6.16683V3.50016H10.0003V6.16683H6.66699ZM9.00033 10.8335C8.44699 10.8335 8.00033 10.3868 8.00033 9.8335C8.00033 9.28016 8.44699 8.8335 9.00033 8.8335C9.55366 8.8335 10.0003 9.28016 10.0003 9.8335C10.0003 10.3868 9.55366 10.8335 9.00033 10.8335Z" fill="#CE0E2D"/>
                                                                </svg>

                                                                {hotel.hotelDetail.hotelTransportation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Pagination for Mobile */}
                        {isMobile && totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 mb-4">
                                {/* Previous button */}
                                <button
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    className={`theme-pagination -prev${currentPage === 1 ? ' disable' : ''}`}
                                    disabled={currentPage === 1}
                                >
                                    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.26367 2.2625L3.53867 8L9.26367 13.7375L7.50117 15.5L0.00117141 8L7.50117 0.5L9.26367 2.2625Z" fill="#CE0E2D"/>
                                    </svg>
                                </button>
                                
                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`theme-pagination${page === currentPage ? ' active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                {/* Next button */}
                                <button
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    className={`theme-pagination -next${currentPage === totalPages ? ' disable' : ''}`}
                                    disabled={currentPage === totalPages}
                                >
                                    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.738281 13.7375L6.46328 8L0.738281 2.2625L2.50078 0.5L10.0008 8L2.50078 15.5L0.738281 13.7375Z" fill="#CE0E2D"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Map - Right Side (Desktop Only) */}
                    {!isMobile && (
                        <div className="w-[45%]">
                            <div className="relative h-full overflow-hidden">
                                {!mapLoaded && (
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                                        <div className="text-gray-500">Loading map...</div>
                                    </div>
                                )}
                                <div 
                                    ref={mapRef} 
                                    className="w-full h-full"
                                    style={{ minHeight: '776px' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
