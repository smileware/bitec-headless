'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GalleryCard({ gallery }) {
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

    return (
        <article className="content-item -gallery">
            <div className="pic">
                <Link
                    href={
                        currentLang === 'th'
                            ? `/th/gallery/${gallery.translations && gallery.translations[0]?.slug ? gallery.translations[0].slug : gallery.slug}`
                            : `/gallery/${gallery.slug}`
                    }
                    title={`Permalink to ${currentLang === 'th'
                        ? (gallery.translations && gallery.translations[0]?.title ? gallery.translations[0].title : gallery.title)
                        : gallery.title
                    }`}
                >
                    <Image
                        src={gallery.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                        alt={gallery.featuredImage?.node?.altText || gallery.title}
                        width={400}
                        height={225}
                        className="w-full h-auto"
                    />
                </Link>
            </div>
            <div className="info">
                <header className="entry-header">
                    <h2 className="entry-title">

                        <Link
                            href={
                                currentLang === 'th'
                                    ? `/th/gallery/${gallery.translations && gallery.translations[0]?.slug ? gallery.translations[0].slug : gallery.slug}`
                                    : `/gallery/${gallery.slug}`
                            }
                        >
                            {currentLang === 'th'
                                ? (gallery.translations && gallery.translations[0]?.title ? gallery.translations[0].title : gallery.title)
                                : gallery.title
                            }
                        </Link>
                    </h2>
                    <div className="entry-date">
                        <span className="text-[18px] font-400 leading-[1.1] text-black">
                            {gallery.date
                                ? new Date(gallery.date).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })
                                : ''}
                        </span>
                    </div>
                </header>
            </div>
        </article>
    );
} 