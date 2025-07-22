'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NewsCard({ news }) {
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
        return 'en';
    };
    
    const currentLang = getCurrentLanguage();

    // Helper function to format news date
    const formatNewsDate = () => {
        const monthNames = {
            en: {
                January: "January",
                February: "February",
                March: "March",
                April: "April",
                May: "May",
                June: "June",
                July: "July",
                August: "August",
                September: "September",
                October: "October",
                November: "November",
                December: "December"
            },
            th: {
                January: "มกราคม",
                February: "กุมภาพันธ์",
                March: "มีนาคม",
                April: "เมษายน",
                May: "พฤษภาคม",
                June: "มิถุนายน",
                July: "กรกฎาคม",
                August: "สิงหาคม",
                September: "กันยายน",
                October: "ตุลาคม",
                November: "พฤศจิกายน",
                December: "ธันวาคม"
            }
        };

        if (!news.date) return '';
        
        const newsDate = new Date(news.date);
        const day = newsDate.getDate();
        const monthEn = newsDate.toLocaleDateString('en-US', { month: 'long' });
        const month = monthNames[currentLang][monthEn];
        const year = newsDate.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    return (
        <article className="content-item -news">
            <div className="pic">
                <Link
                    href={
                        currentLang === 'th'
                            ? `/th/news/${news.translations && news.translations[0]?.slug ? news.translations[0].slug : news.slug}`
                            : `/news/${news.slug}`
                    }
                    title={`Permalink to ${currentLang === 'th'
                        ? (news.translations && news.translations[0]?.title ? news.translations[0].title : news.title)
                        : news.title
                    }`}
                >
                    <Image
                        src={news.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                        alt={news.featuredImage?.node?.altText || news.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                    />
                </Link>
            </div>
            <div className="info">
                <div className="entry-meta">
                    {news.categories?.nodes?.length > 0 && (
                        <div className="news-categories">
                            {news.categories.nodes.map((cat) => (
                                <div key={cat.id} className="news-category uppercase">
                                    {cat.name}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display published date */}
                    {news.date && (
                        <div className="published-date">
                            {formatNewsDate()}
                        </div>
                    )}
                </div>
                <header className="entry-header">
                    <h2 className="entry-title">
                        <Link
                            href={
                                currentLang === 'th'
                                    ? `/th/news/${news.translations && news.translations[0]?.slug ? news.translations[0].slug : news.slug}`
                                    : `/news/${news.slug}`
                            }
                        >
                            {currentLang === 'th'
                                ? (news.translations && news.translations[0]?.title ? news.translations[0].title : news.title)
                                : news.title
                            }
                        </Link>
                    </h2>
                </header>
            </div>
        </article>
    );
} 