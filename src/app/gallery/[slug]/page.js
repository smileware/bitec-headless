import { getGalleryBySlug } from "../../lib/gallery";
import Image from 'next/image';
import ShareButtons from "../../components/ShareButtons";
import GallerySwiper from '../../components/GallerySwiper';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return {};

  const title = gallery.title || 'Gallery';
  const description = '';
  const image = gallery?.featuredImage?.node?.sourceUrl
    || gallery?.galleryUpload?.galleryUpload?.nodes?.[0]?.sourceUrl;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function GalleryPage({ params }) {
    const { slug } = await params;
    const gallery = await getGalleryBySlug(slug);
    const currentLang = 'en';

    if (!gallery) {
        return (
            <div>
                <h1>Page not found</h1>
            </div>
        );
    }

    const formatGalleryDate = () => {
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

        if (!gallery.date) return '';
        
        const galleryDate = new Date(gallery.date);
        const day = galleryDate.getDate();
        const monthEn = galleryDate.toLocaleDateString('en-US', { month: 'long' });
        const month = monthNames[currentLang][monthEn];
        const year = galleryDate.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    return (
        <div>
            <article className="bg-white">
                <header className="bg-[#F4F4F4] lg:py-[100px] py-[40px]">
                    <div className="grid lg:grid-cols-[calc(50%+50px)_1fr] grid-cols-1 lg:gap-[50px] gap-[20px] max-w-[1380px] mx-auto px-[20px]">
                        <div className="">
                            {gallery.featuredImage?.node?.sourceUrl && (
                                <Image
                                    src={gallery.featuredImage.node.sourceUrl}
                                    alt={gallery.featuredImage.node.altText || gallery.title}
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

                                        {gallery.date && (
                                            <div className="text-[#161616] lg:text-[18px] text-[20px]">
                                                {formatGalleryDate()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h1 className="lg:text-[39px] text-[30px] !leading-[1.1] font-[500] text-[#161616] lg:mt-[20px] mt-[10px]">{gallery.title}</h1>
                                </div>

                                <ShareButtons title={gallery.title} color="#454545" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1380px] mx-auto lg:py-[50px] py-[40px] lg:px-[20px] px-[0px]">
                    {gallery.galleryUpload?.galleryUpload?.nodes?.length > 0 ? (
                        <GallerySwiper images={gallery.galleryUpload.galleryUpload.nodes} />
                    ) : (
                        <div>No images found in this gallery.</div>
                    )}
                </main>
            </article>
        </div>
    );
} 