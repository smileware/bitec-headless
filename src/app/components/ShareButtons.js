'use client';

import React from 'react';
import { useEffect, useState } from 'react';

export default function ShareButtons({ title, url }) {
    const [isClient, setIsClient] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
        setShareUrl(url || window.location.href);
    }, [url]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Don't render until client-side to prevent hydration errors
    if (!isClient) {
        return (
            <div className="flex items-center gap-[20px] lg:mt-6">
                <span className="text-[#B5B5B8] text-[20px] mr-2 font-light">SHARE</span>
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-[20px] lg:mt-6">
            {/* Share Buttons */}
            <span className="text-[#B5B5B8] text-[20px] mr-2 font-light">SHARE</span>
            {/* Facebook */}
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
                title="Share on Facebook"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B5B5B8] h-[20px] w-[20px] hover:text-[#ce2030]" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                </svg>
            </a>
            {/* X (Twitter) */}
            <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
                title="Share on X"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B5B5B8] h-[20px] w-[20px] hover:text-[#ce2030]" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                </svg>
            </a>
            {/* Threads */}
            <a
                href={`https://www.threads.net/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
                title="Share on Threads"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B5B5B8] h-[20px] w-[20px] hover:text-[#ce2030]" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                </svg>
            </a>
            {/* LINE */}
            <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
                title="Share on LINE"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="text-[#B5B5B8] h-[20px] w-[20px] hover:text-[#ce2030]" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.433-.555 2.723-1.715 3.994-1.678 1.932-5.431 4.285-6.285 4.645-.83.35-.734-.197-.696-.413l.003-.018.114-.685c.027-.204.055-.521-.026-.723-.09-.223-.444-.339-.704-.395C2.846 12.39 0 9.701 0 6.492 0 2.912 3.59 0 8 0M5.022 7.686H3.497V4.918a.156.156 0 0 0-.155-.156H2.78a.156.156 0 0 0-.156.156v3.486c0 .041.017.08.044.107v.001l.002.002.002.002a.15.15 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157m.791-2.924a.156.156 0 0 0-.156.156v3.486c0 .086.07.155.156.155h.562c.086 0 .155-.07.155-.155V4.918a.156.156 0 0 0-.155-.156zm3.863 0a.156.156 0 0 0-.156.156v2.07L7.923 4.832l-.013-.015v-.001l-.01-.01-.003-.003-.011-.009h-.001L7.88 4.79l-.003-.002-.005-.003-.008-.005h-.002l-.003-.002-.01-.004-.004-.002-.01-.003h-.002l-.003-.001-.009-.002h-.006l-.003-.001h-.004l-.002-.001h-.574a.156.156 0 0 0-.156.155v3.486c0 .086.07.155.156.155h.56c.087 0 .157-.07.157-.155v-2.07l1.6 2.16a.2.2 0 0 0 .039.038l.001.001.01.006.004.002.008.004.007.003.005.002.01.003h.003a.2.2 0 0 0 .04.006h.56c.087 0 .157-.07.157-.155V4.918a.156.156 0 0 0-.156-.156zm3.815.717v-.56a.156.156 0 0 0-.155-.157h-2.242a.16.16 0 0 0-.108.044h-.001l-.001.002-.002.003a.16.16 0 0 0-.044.107v3.486c0 .041.017.08.044.107l.002.003.002.002a.16.16 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156Z"/>
                </svg>
            </a>
            {/* Copy Link */}
            <div className="relative">
                <button
                    onClick={handleCopyLink}
                    className="cursor-pointer flex items-center"
                    title="Copy link"
                    type="button"
                >
                    <svg width="18" height="10" className="text-[#B5B5B8] h-[20px] w-[20px] hover:text-[#ce2030]" viewBox="0 0 18 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.97786 4.99998C1.97786 3.57498 3.1362 2.41665 4.5612 2.41665H7.89453V0.833313H4.5612C2.2612 0.833313 0.394531 2.69998 0.394531 4.99998C0.394531 7.29998 2.2612 9.16665 4.5612 9.16665H7.89453V7.58331H4.5612C3.1362 7.58331 1.97786 6.42498 1.97786 4.99998ZM5.39453 5.83331H12.0612V4.16665H5.39453V5.83331ZM12.8945 0.833313H9.5612V2.41665H12.8945C14.3195 2.41665 15.4779 3.57498 15.4779 4.99998C15.4779 6.42498 14.3195 7.58331 12.8945 7.58331H9.5612V9.16665H12.8945C15.1945 9.16665 17.0612 7.29998 17.0612 4.99998C17.0612 2.69998 15.1945 0.833313 12.8945 0.833313Z"/>
                    </svg>
                </button>
                {copied && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        Copied!
                    </div>
                )}
            </div>
        </div>
    );
} 