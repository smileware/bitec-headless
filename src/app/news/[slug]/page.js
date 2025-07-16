import { getPostBySlug } from "../../lib/news-activity";
import ScriptLoader from '../../components/ScriptLoader';
import Image from 'next/image';
import ShareButtons from "../../components/ShareButtons";

export default async function NewsPage({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug, 'en');
    const currentLang = 'en';

    if (!post) {
        return (
            <div>
                <h1>Page not found</h1>
            </div>
        );
    }

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

        if (!post.date) return '';
        
        const newsDate = new Date(post.date);
        const day = newsDate.getDate();
        const monthEn = newsDate.toLocaleDateString('en-US', { month: 'long' });
        const month = monthNames[currentLang][monthEn];
        const year = newsDate.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    return (
        <div>
            {post.greenshiftInlineCss && (
                <style dangerouslySetInnerHTML={{ __html: post.greenshiftInlineCss }} />
            )}
            <article className="bg-white">
                <header className="bg-[#F4F4F4] lg:py-[100px] py-[40px]">
                    <div className="grid lg:grid-cols-[calc(50%+50px)_1fr] grid-cols-1 lg:gap-[50px] gap-[20px] max-w-[1380px] mx-auto px-[20px]">
                        <div className="">
                            {post.featuredImage?.node?.sourceUrl && (
                                <Image
                                    src={post.featuredImage.node.sourceUrl}
                                    alt={post.featuredImage.node.altText || post.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            )}
                        </div>
                        <div className="">
                            <div className="h-full flex flex-col lg:justify-between lg:gap-4 text-white text-[20px] pb-0">
                                <div className="pb-6 lg:pb-0">
                                    <div className="flex gap-[10px] items-center">

                                        {post.categories?.nodes?.map((cat, index) => (
                                            <span
                                                key={cat.id}
                                                className="text-[var(--s-accent)] lg:text-[18px] text-[20px] flex items-center"
                                            >
                                                {cat.name}
                                                {index < post.categories.nodes.length - 1 && (
                                                    <span className="ml-[10px] text-[#bbb] text-[var(--s-accent)] lg:text-[18px] text-[20px]">|</span>
                                                )}
                                            </span>
                                        ))}

                                        {post.date && (
                                            <div className="text-[#161616] lg:text-[18px] text-[20px]">
                                                {formatNewsDate()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h1 className="lg:text-[39px] text-[30px] !leading-[1.1] font-[500] text-[#161616] lg:mt-[20px] mt-[10px]">{post.title}</h1>
                                </div>

                                <ShareButtons title={post.title} color="#454545" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1380px] mx-auto lg:py-[50px] py-[40px] px-[20px]">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </main>
            </article>

            <ScriptLoader scripts={post.greenshiftScripts} />
        </div>
    );
} 