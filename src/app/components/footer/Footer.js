"use client";

import { useState, useEffect } from "react";
import { getFooterData, generateStyleTags } from "../../lib/footer";

export default function Footer({ footerData = null, isServerSide = false }) {
    const [localFooterData, setLocalFooterData] = useState(footerData);
    const [isLoading, setIsLoading] = useState(!isServerSide);

    // Use server data if provided, otherwise fetch client-side
    useEffect(() => {
        if (isServerSide && footerData) {
            setLocalFooterData(footerData);
            setIsLoading(false);
            return;
        }

        async function fetchFooterData() {
            setIsLoading(true);
            try {
                const data = await getFooterData();
                setLocalFooterData(data);
            } catch (error) {
                console.error("Error loading footer data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFooterData();
    }, [isServerSide, footerData]);

    // Mobile menu toggle functionality - runs after footer data is loaded
    useEffect(() => {
        // Only run if footer data is loaded and not loading
        if (!localFooterData || isLoading) return;

        const toggleButton = document.querySelector(".menu-footer-accordion");
        const mobileMenu = document.getElementById("mobile_menu");

        if (mobileMenu) {
            mobileMenu.style.display = 'none';
        }

        const handleToggle = () => {
            if (mobileMenu) {
                const isHidden = mobileMenu.style.display === 'none';
                mobileMenu.style.display = isHidden ? 'block' : 'none';
                
                // Toggle active class on the toggle button
                if (toggleButton) {
                    if (isHidden) {
                        toggleButton.classList.add('active');
                    } else {
                        toggleButton.classList.remove('active');
                    }
                }
            }
        };

        if (toggleButton && mobileMenu) {
            toggleButton.addEventListener("click", handleToggle);
        }

        // Cleanup function
        return () => {
            if (toggleButton) {
                toggleButton.removeEventListener("click", handleToggle);
            }
        };
    }, [localFooterData, isLoading]); // Depend on localFooterData and isLoading

    if (isLoading) {
        return <footer></footer>;
    }

    // Generate style tags from processed styles
    const styleTagsHTML = localFooterData?.processedStyles
        ? generateStyleTags(localFooterData.processedStyles)
        : "";

    return (
        <footer className="relative">
            {/* Render the footer content */}
            {localFooterData?.content && (
                <div dangerouslySetInnerHTML={{ __html: localFooterData.content }} />
            )}
            
            {/* Add the processed styles to the head */}
            {styleTagsHTML && (
                <div dangerouslySetInnerHTML={{ __html: styleTagsHTML }} />
            )}
            <button
                onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="absolute top-0 right-0 bg-[#BB0D29] text-white h-[50px] w-[85px] lg:w-[50px] font-bold text-[18px] !leading-none flex flex-col items-center justify-center cursor-pointer"
                aria-label="Scroll to top"
            >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.666015 9.00016L2.13477 10.4689L7.95768 4.65641L7.95768 17.3335L10.041 17.3335L10.041 4.65641L15.8639 10.4689L17.3327 9.00016L8.99935 0.666828L0.666015 9.00016Z" fill="white"/>
                </svg>
                TOP
            </button>
        </footer>
    );
}
