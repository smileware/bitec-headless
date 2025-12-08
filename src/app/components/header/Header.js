'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import Nav from "./Nav";
import TopNav from "./TopNav";
import LanguageSwitcher from "../LanguageSwitcher";

import { getPrimaryMenu, getTopMenu, getCTA, getMobileMenu, getHeaderData } from '../../lib/header';
import { SkeletonText, SkeletonButton } from '../ui/Skeleton';

export default function Header({ headerData = null, isServerSide = false }) {
    const [isClient, setIsClient] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [menuTopItems, setMenuTopItems] = useState([]);
    const [menuMobileItems, setMenuMobileItems] = useState([]);
    const [ctaData, setCtaData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuRefreshing, setIsMenuRefreshing] = useState(false);
    const [isNavActive, setIsNavActive] = useState(false);
    const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
    const pathname = usePathname();
    
    const currentLang = useMemo(() => {
        const pathSegments = pathname.split('/').filter(Boolean);
        
        if (pathSegments.length > 0) {
            const firstSegment = pathSegments[0];
            if (['th', 'en'].includes(firstSegment)) {
                return firstSegment;
            }
        }
        return 'en'; // default
    }, [pathname]);
    
    // Memoize home URL
    const homeUrl = useMemo(() => {
        return currentLang === 'en' ? '/' : `/${currentLang}`;
    }, [currentLang]);

    // Use server-side data if provided, otherwise fetch client-side
    useEffect(() => {
        // If server-side data is provided, use it (cached, loads only once)
        if (isServerSide && headerData && headerData[currentLang]) {
            const data = headerData[currentLang];
            setMenuItems(data.primaryMenu?.menuItems || []);
            setMenuTopItems(data.topMenu?.menuTopItems || []);
            setMenuMobileItems(data.mobileMenu?.menuMobileItems || []);
            setCtaData(data.cta);
            setIsLoading(false);
            return; // Don't fetch client-side if server data exists
        }
        
        // Only fetch client-side if no server data provided
        async function fetchMenuData() {
            setIsLoading(true);
            setIsMenuRefreshing(true);
            try {
                // Use the new server-side function for better performance
                const data = await getHeaderData(currentLang);
                setMenuItems(data.primaryMenu?.menuItems || []);
                setMenuTopItems(data.topMenu?.menuTopItems || []);
                setMenuMobileItems(data.mobileMenu?.menuMobileItems || []);
                setCtaData(data.cta);
            } catch (error) {
                console.error('Error loading menu data:', error);
            } finally {
                setIsLoading(false);
                // show the top bar for a tiny bit to be noticeable
                setTimeout(() => setIsMenuRefreshing(false), 200);
            }
        }
        fetchMenuData();
    }, [currentLang, isServerSide, headerData]);

    // Hydration fix - only set client state after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Apply classes when nav state changes
    useEffect(() => {
        const pageElement = document.getElementById('page');
        const siteToggle = document.querySelector('.site-toggle');
        const siteNavM = document.querySelector('.site-nav-m');

        if (isNavActive) {
            // Add active classes
            if (siteToggle) siteToggle.classList.add('active');
            if (siteNavM) siteNavM.classList.add('active');
            if (pageElement) pageElement.classList.add('show-nav');
        } else {
            // Remove active classes
            if (siteToggle) siteToggle.classList.remove('active');
            if (siteNavM) siteNavM.classList.remove('active');
            if (pageElement) pageElement.classList.remove('show-nav');
        }
    }, [isNavActive]);

    // Memoize menu trees to avoid rebuilding on every render
    const tree = useMemo(() => buildMenuTree(menuItems), [menuItems]);
    const treeTop = useMemo(() => buildMenuTree(menuTopItems), [menuTopItems]);
    const treeMobile = useMemo(() => buildMenuTree(menuMobileItems), [menuMobileItems]);

    // Get appropriate CTA buttons based on current language
    const ctaButtons = useMemo(() => {
        if (!ctaData?.callToActionButtons) return null;
        
        const buttons = ctaData.callToActionButtons;
        
        return {
            requestAProposal: currentLang === 'th' ? buttons.requestAProposalThai : buttons.requestAProposal,
            getInTouch: currentLang === 'th' ? buttons.getInTouchThai : buttons.getInTouch,
            getInTouchLabel: currentLang === 'th' ? buttons.getInTouchLabelThai : buttons.getInTouchLabel
        };
    }, [ctaData, currentLang]);

    // Skeleton components for menu loading
    const TopNavSkeleton = () => (
        <div className="flex items-center space-x-6 _desktop">
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
        </div>
    );

    const MainNavSkeleton = () => (
        <div className="flex items-center space-x-8 _desktop" aria-label="Loading navigation">
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
            <SkeletonText lines={1} className="w-16 h-4" />
        </div>
    );

    function buildMenuTree(items) {
        const map = {};
        const roots = [];
      
        items.forEach(item => {
          map[item.id] = { ...item, children: [] };
        });
      
        items.forEach(item => {
          const parentId = item.parentId;
      
          if (!parentId || !map[parentId]) {
            roots.push(map[item.id]);
          } else {
            map[parentId].children.push(map[item.id]);
          }
        });
      
        return roots;
    }

    // Handle site toggle click
    const handleSiteToggle = () => {
        setIsNavActive(!isNavActive);
    };

    // Handle closing mobile menu
    const handleCloseMobileMenu = () => {
        setIsNavActive(false);
    };

    // Toggle Get In Touch dropdown
    const toggleGetInTouch = () => {
        setIsGetInTouchOpen(!isGetInTouchOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isGetInTouchOpen && !event.target.closest('.get-in-touch-dropdown')) {
                setIsGetInTouchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isGetInTouchOpen]);

    // Apply classes when nav state changes
    useEffect(() => {
        const pageElement = document.getElementById('page');
        const siteToggle = document.querySelector('.site-toggle');
        const siteNavM = document.querySelector('.site-nav-m');

        if (isNavActive) {
            // Add active classes
            if (siteToggle) siteToggle.classList.add('active');
            if (siteNavM) siteNavM.classList.add('active');
            if (pageElement) pageElement.classList.add('show-nav');
        } else {
            // Remove active classes
            if (siteToggle) siteToggle.classList.remove('active');
            if (siteNavM) siteNavM.classList.remove('active');
            if (pageElement) pageElement.classList.remove('show-nav');
        }
    }, [isNavActive]);

    // Don't render until client-side to prevent hydration errors
    if (!isClient) {
        return (
            <header className="site-header">
                <div className="container">
                    <div className="flex items-center justify-between py-4">
                        <SkeletonText lines={1} className="w-32 h-8" />
                        <div className="flex items-center space-x-4">
                            <SkeletonText lines={1} className="w-16 h-4" />
                            <SkeletonText lines={1} className="w-16 h-4" />
                            <SkeletonText lines={1} className="w-16 h-4" />
                        </div>
                    </div>
                </div>
            </header>
        );
    }
    
    return (
        <>
            <style jsx>{`
                .get-in-touch-dropdown svg {
                    width: 24px;
                    height: 24px;
                    max-width: 24px;
                    max-height: 24px;
                }
            `}</style>
            <header className="site-header _heading">
                {isMenuRefreshing && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #CE0E2D 0%, #FF6B81 50%, #CE0E2D 100%)',
                        backgroundSize: '200% 100%', animation: 'bitecTopBar 1.2s ease-in-out infinite', zIndex: 10000
                    }} />
                )}
            <div className="w-full flex justify-between items-center">
                <div className="lg:border-r lg:border-[#ddddde] h-full min-h-[var(--s-header-height)] flex items-center lg:px-12 px-[20px]">
                    <Link
                        className="w-full h-full lg:min-w-[102px] min-w-[70px]"
                        href={homeUrl}
                        aria-label="Brand"
                    >
                        <Image
                            src="/img/logo.svg"
                            alt="Logo"
                            width={102}
                            height={56}
                            className="object-contain"
                        />
                    </Link>
                </div>

                <div
                    id="navtoggle"
                    className={`_mobile custom-s site-toggle ${isNavActive ? 'active' : ''}`}
                    title="Toggle Menu"
                    onClick={handleSiteToggle}
                >
                    <b></b>
                </div>

                <div className="flex flex-col w-full">
                    {/* Top Nav */}
                    <div className="flex h-[40px] items-center justify-end mb-0 lg:border-b lg:border-[#ddddde] pr-12">
                        {isLoading ? <TopNavSkeleton /> : <TopNav nav={treeTop} />}
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Nav */}
                    <nav id="site-nav-m" className="site-nav-m _mobile">
                        <div className="menu-main-menu-container">
                            <ul id="mobile-menu" className="menu">
                                <Nav nav={treeMobile} isMobile={true} onCloseMenu={handleCloseMobileMenu} />
                            </ul>
                        </div>
                    </nav>

                    {/* Primary Nav */}
                    <nav id="site-navigation" className="site-nav-d _desktop h-[60px] pr-12" aria-label="Global"
                    >
                        <div className="flex items-center">
                            <div className="menu-main-menu-container">
                                <ul id="primary-menu" className="menu">
                                    {isLoading ? <MainNavSkeleton /> : <Nav nav={tree} isMobile={false} />}
                                </ul>
                            </div>
                            <div className="flex items-center space-x-3 xl:ml-6 ml-3">
                                {isLoading ? (
                                    <>
                                        <SkeletonButton className="w-24 h-8" />
                                        <SkeletonButton className="w-32 h-8" />
                                    </>
                                ) : (
                                    <>
                                        {ctaButtons?.getInTouch && ctaButtons.getInTouch.length > 0 && (
                                            <div className="get-in-touch-dropdown relative">
                                                <button
                                                    onClick={toggleGetInTouch}
                                                    className="btn btn-cta-get-in-touch xl:px-[16px] px-[10px] py-[5px] font-medium uppercase border-0 rounded-md transition-colors flex items-center justify-center rounded-none cursor-pointer"
                                                >
                                                    {ctaButtons.getInTouchLabel || 'GET IN TOUCH'}

                                                    <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="pl-[10px]">
                                                        <path d="M14.8896 3.10813C11.6345 -0.146883 6.36617 -0.147371 3.1107 3.10813C0.493192 5.7256 -0.00142664 9.6176 1.54605 12.7171L0.688134 16.4908C0.576622 16.9813 1.01622 17.4211 1.5069 17.3096L5.2806 16.4516C10.7675 19.1911 17.3291 15.225 17.3291 8.99759C17.3291 6.7729 16.4627 4.68131 14.8896 3.10813ZM10.7376 11.0716H5.52522C5.14739 11.0716 4.8411 10.7654 4.8411 10.3875C4.8411 10.0097 5.14739 9.70341 5.52522 9.70341H10.7376C11.1154 9.70341 11.4217 10.0097 11.4217 10.3875C11.4217 10.7654 11.1154 11.0716 10.7376 11.0716ZM12.475 8.29174H5.52522C5.14739 8.29174 4.8411 7.98545 4.8411 7.60762C4.8411 7.22979 5.14739 6.9235 5.52522 6.9235H12.475C12.8529 6.9235 13.1592 7.22979 13.1592 7.60762C13.1592 7.98545 12.8528 8.29174 12.475 8.29174Z" fill="white"/>
                                                    </svg>
                                                </button>
                                                
                                                {isGetInTouchOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg overflow-hidden z-50">
                                                        {ctaButtons.getInTouch.map((item, index) => (
                                                            <Link
                                                                key={index}
                                                                href={item.ctaLink?.url || '#'}
                                                                target={item.ctaLink?.target || '_blank'}
                                                                className="btn btn-cta-get-in-touch xl:px-[16px] px-[10px] py-[5px] font-medium uppercase border-0 rounded-md transition-colors flex items-center justify-between rounded-none cursor-pointer border-b border-[#636363] last:border-b-0 !mr-0"
                                                                onClick={() => setIsGetInTouchOpen(false)}
                                                            >
                                                                
                                                                {item.ctaLink?.title || 'Link'}

                                                                {item.ctaIcon && (
                                                                    <span 
                                                                        className="flex-shrink-0 flex items-center justify-center"
                                                                        dangerouslySetInnerHTML={{ __html: item.ctaIcon }}
                                                                    />
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {ctaButtons?.requestAProposal && (
                                            <Link
                                                href={ctaButtons.requestAProposal.url}
                                                target={ctaButtons.requestAProposal.target || '_self'}
                                                className="btn btn-cta-proposal xl:px-[16px] px-[10px] py-[5px] font-medium uppercase border-0 rounded-md transition-colors flex items-center justify-center rounded-none"
                                            >
                                                {ctaButtons.requestAProposal.title}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
                
            </div>
        </header>
        </>
    );
}
