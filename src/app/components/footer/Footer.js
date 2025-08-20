"use client";
import React, { useState, useEffect } from "react";
import { getFooterData, generateStyleTags } from "../../lib/footer";
import { usePathname } from 'next/navigation';


export function useLangFromPath() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
  
    if (pathSegments.length > 0 && ["en", "th"].includes(pathSegments[0])) {
      return pathSegments[0];
    }
    return "en"; // default
}

export default function Footer({ footerData = null, isServerSide = false }) {
    const [localFooterData, setLocalFooterData] = useState(footerData);
    const [isLoading, setIsLoading] = useState(!isServerSide);
    const currentLang = useLangFromPath();
    // Use server data if provided, otherwise fetch client-side
    useEffect(() => {
        if (isServerSide && footerData) {
          setLocalFooterData(footerData);
          setIsLoading(false);
          return;
        }
        let cancelled = false;
        (async () => {
          setIsLoading(true);
          try {
            const data = await getFooterData();
            if (!cancelled) setLocalFooterData(data);
          } catch (error) {
            console.error("Error loading footer data:", error);
          } finally {
            if (!cancelled) setIsLoading(false);
          }
        })();
        return () => { cancelled = true; };
      }, [isServerSide, footerData]);
    

    // Mobile menu toggle functionality - runs after footer data is loaded
    useEffect(() => {
        if (!localFooterData || isLoading) return;

        let timeoutId;
        let retryCount = 0;
        const maxRetries = 10;
        let cleanupFunction = null;
        let observer = null;

        const setupToggle = () => {
            const toggleButton = document.querySelector(".menu-footer-accordion");
            const mobileMenu = document.getElementById("mobile_menu");

            if (!toggleButton || !mobileMenu) {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutId = setTimeout(setupToggle, 100);
                }
                return;
            }

            // Always reset hidden state & active class after render/lang swap
            mobileMenu.style.display = "none";
            toggleButton.classList.remove("active");

            const handleToggle = () => {
                const isHidden = mobileMenu.style.display === "none";
                mobileMenu.style.display = isHidden ? "block" : "none";
                
                if (isHidden) {
                    toggleButton.classList.add("active");
                } else {
                    toggleButton.classList.remove("active");
                }
            };

            // Remove any existing listeners first
            toggleButton.removeEventListener("click", handleToggle);
            // Add new listener
            toggleButton.addEventListener("click", handleToggle);

            // Store cleanup function
            cleanupFunction = () => {
                toggleButton.removeEventListener("click", handleToggle);
            };

            // Set up MutationObserver to watch for DOM changes
            const footerElement = document.querySelector('footer');
            if (footerElement && !observer) {
                observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            // Check if toggle elements were added/removed
                            const hasToggleButton = footerElement.querySelector(".menu-footer-accordion");
                            const hasMobileMenu = footerElement.querySelector("#mobile_menu");
                            
                            if (hasToggleButton && hasMobileMenu) {
                                // Re-setup toggle if elements are present
                                retryCount = 0;
                                setupToggle();
                            }
                        }
                    });
                });

                observer.observe(footerElement, {
                    childList: true,
                    subtree: true
                });
            }
        };

        // Global click handler as fallback
        const globalClickHandler = (event) => {
            if (event.target.classList.contains('menu-footer-accordion')) {
                const mobileMenu = document.getElementById("mobile_menu");
                if (mobileMenu) {
                    const isHidden = mobileMenu.style.display === "none";
                    mobileMenu.style.display = isHidden ? "block" : "none";
                    
                    if (isHidden) {
                        event.target.classList.add("active");
                    } else {
                        event.target.classList.remove("active");
                    }
                }
            }
        };

        // Add global click listener
        document.addEventListener('click', globalClickHandler);

        // Start setup with a small delay to ensure DOM is ready
        timeoutId = setTimeout(setupToggle, 50);
        
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (cleanupFunction) {
                cleanupFunction();
            }
            if (observer) {
                observer.disconnect();
            }
            document.removeEventListener('click', globalClickHandler);
        };
    }, [localFooterData, isLoading, currentLang]);

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
            {currentLang === 'th' ? (
                localFooterData?.translations[0]?.content && (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: localFooterData.translations[0].content,
                        }}
                    />
                )
            ) : (
                localFooterData?.content && (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: localFooterData.content,
                        }}
                    />
                )
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
