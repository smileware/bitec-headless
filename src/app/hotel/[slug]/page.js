import { getHotelBySlug } from "../../lib/hotel";
import ScriptLoader from '../../components/ScriptLoader';
import Image from 'next/image';
import ShareButtons from "../../components/ShareButtons";
import GallerySwiper from "../../components/GallerySwiper";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return {};

  const title = hotel.title || 'Hotel';
  const description = ((hotel.hotelDetail?.hotelContent?.map?.(s => s?.hotelContent)?.join(' ') || '')
    .replace(/<[^>]*>/g, '')
    .trim() || '').slice(0, 160);
  const image = hotel.featuredImage?.node?.sourceUrl;

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

export default async function HotelPage({ params }) {
    const { slug } = await params;
    const hotel = await getHotelBySlug(slug);

    if (!hotel) {
        return (
            <div>
                <h1>Hotel not found</h1>
                <p>Could not find hotel: {slug}</p>
            </div>
        );
    }

    return (
        <div>
            {hotel.greenshiftInlineCss && (
                <style dangerouslySetInnerHTML={{ __html: hotel.greenshiftInlineCss }} />
            )}
            <article className="content-hotel">
                <header className="bg-[#161616] lg:py-[100px] py-[40px]">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 max-w-[1380px] mx-auto px-[20px]">
                        <div className="lg:pr-[60px] order-2 lg:order-1">
                            <div className="h-full flex flex-col lg:justify-between lg:gap-4 text-white text-[20px] pb-5 lg:pb-0">
                                <div className="">

                                    <h1 className="lg:text-[51px] text-[39px] !leading-[1.1] font-[500] text-white mt-0  lg:mb-[40px] mb-[20px]">{hotel.title}</h1>
                                    
                                    {/* Full Address */}
                                    {hotel.hotelDetail?.hotelAddress && (
                                        <div className="flex gap-[15px] text-[22px] mb-[20px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" className="w-[20px] h-[20px] min-w-[18px] mt-[4px]">
                                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                            </svg>
                                            <span className="text-white leading-[1.2]">
                                                {hotel.hotelDetail.hotelAddress}
                                            </span>
                                        </div>
                                    )}

                                    {/* Transportation */}
                                    {hotel.hotelDetail?.hotelTransportation && (
                                         <div className="flex gap-[15px] text-[22px] mb-[20px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-[20px] h-[20px] min-w-[18px] mt-[4px]">
                                                <path d="M6.00033 0.833496C3.33366 0.833496 0.666992 1.16683 0.666992 3.50016V9.8335C0.666992 11.1202 1.71366 12.1668 3.00033 12.1668L2.00033 13.1668V13.5002H3.48699L4.82032 12.1668H7.33366L8.66699 13.5002H10.0003V13.1668L9.00033 12.1668C10.287 12.1668 11.3337 11.1202 11.3337 9.8335V3.50016C11.3337 1.16683 8.94699 0.833496 6.00033 0.833496ZM3.00033 10.8335C2.44699 10.8335 2.00033 10.3868 2.00033 9.8335C2.00033 9.28016 2.44699 8.8335 3.00033 8.8335C3.55366 8.8335 4.00033 9.28016 4.00033 9.8335C4.00033 10.3868 3.55366 10.8335 3.00033 10.8335ZM5.33366 6.16683H2.00033V3.50016H5.33366V6.16683ZM6.66699 6.16683V3.50016H10.0003V6.16683H6.66699ZM9.00033 10.8335C8.44699 10.8335 8.00033 10.3868 8.00033 9.8335C8.00033 9.28016 8.44699 8.8335 9.00033 8.8335C9.55366 8.8335 10.0003 9.28016 10.0003 9.8335C10.0003 10.3868 9.55366 10.8335 9.00033 10.8335Z"/>
                                            </svg>
                                            <span className="text-white leading-[1.2]">
                                                {hotel.hotelDetail.hotelTransportation}
                                            </span>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    {hotel.hotelDetail?.hotelPhoneNumber && (
                                        <div className="flex gap-[15px] text-[22px] mb-[20px]">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] min-w-[18px] mt-[4px]">
                                                <path d="M16.3333 12.2083C15.1875 12.2083 14.0875 12.025 13.0608 11.6858C12.74 11.585 12.3825 11.6583 12.1258 11.9058L10.1092 13.9225C7.515 12.6025 5.38833 10.485 4.06833 7.89083L6.085 5.865C6.34167 5.6175 6.415 5.26 6.31417 4.93917C5.975 3.9125 5.79167 2.8125 5.79167 1.66667C5.79167 1.1625 5.37917 0.75 4.875 0.75H1.66667C1.1625 0.75 0.75 1.1625 0.75 1.66667C0.75 10.2742 7.72583 17.25 16.3333 17.25C16.8375 17.25 17.25 16.8375 17.25 16.3333V13.125C17.25 12.6208 16.8375 12.2083 16.3333 12.2083ZM9 0.75V9.91667L11.75 7.16667H17.25V0.75H9Z" fill="white"/>
                                            </svg>

                                            <span className="text-white leading-[1.2]">
                                                {hotel.hotelDetail.hotelPhoneNumber}
                                            </span>
                                        </div>
                                    )}

                                    {/* Email */}
                                    {hotel.hotelDetail?.hotelEmail && (
                                        <div className="flex gap-[15px] text-[22px] mb-[20px]">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] min-w-[18px] mt-[4px]">
                                                <path d="M17.333 0.666992H2.66634C1.65801 0.666992 0.842174 1.49199 0.842174 2.50033L0.833008 13.5003C0.833008 14.5087 1.65801 15.3337 2.66634 15.3337H17.333C18.3413 15.3337 19.1663 14.5087 19.1663 13.5003V2.50033C19.1663 1.49199 18.3413 0.666992 17.333 0.666992ZM17.333 4.33366L9.99967 8.91699L2.66634 4.33366V2.50033L9.99967 7.08366L17.333 2.50033V4.33366Z" fill="white"/>
                                            </svg>

                                            <span className="text-white leading-[1.2]">
                                                {hotel.hotelDetail.hotelEmail}
                                            </span>
                                        </div>
                                    )}

                                    {/* Website */}
                                    {hotel.hotelDetail?.hotelWebsite?.url && (
                                        <div className="flex gap-[15px] text-[22px] mb-[20px]">
                                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] min-w-[18px] mt-[4px]">
                                                <path d="M15.2503 7.16667H14.3337C14.0739 7.16667 13.8562 7.25451 13.6805 7.43021C13.5048 7.6059 13.417 7.82361 13.417 8.08333C13.417 8.34306 13.5048 8.56076 13.6805 8.73646C13.8562 8.91215 14.0739 9 14.3337 9H15.2503C15.51 9 15.7278 8.91215 15.9035 8.73646C16.0791 8.56076 16.167 8.34306 16.167 8.08333C16.167 7.82361 16.0791 7.6059 15.9035 7.43021C15.7278 7.25451 15.51 7.16667 15.2503 7.16667ZM13.692 12.1167L13.0503 11.475C12.867 11.2917 12.6531 11.2038 12.4087 11.2115C12.1642 11.2191 11.9503 11.3069 11.767 11.475C11.5837 11.6583 11.4882 11.876 11.4805 12.1281C11.4729 12.3802 11.5607 12.5979 11.7441 12.7813L12.3857 13.4229C12.5691 13.6063 12.7868 13.6941 13.0389 13.6865C13.291 13.6788 13.5087 13.5833 13.692 13.4C13.86 13.2167 13.9479 13.0028 13.9555 12.7583C13.9632 12.5139 13.8753 12.3 13.692 12.1167ZM13.0503 4.69167L13.692 4.05C13.8753 3.86667 13.9632 3.65278 13.9555 3.40833C13.9479 3.16389 13.86 2.95 13.692 2.76667C13.5087 2.58333 13.291 2.48785 13.0389 2.48021C12.7868 2.47257 12.5691 2.56042 12.3857 2.74375L11.7441 3.38542C11.5607 3.56875 11.4729 3.78646 11.4805 4.03854C11.4882 4.29063 11.5837 4.50833 11.767 4.69167C11.9503 4.85972 12.1642 4.94757 12.4087 4.95521C12.6531 4.96285 12.867 4.875 13.0503 4.69167ZM2.14199 15.6917L5.85449 11.9792L6.54199 14.0417C6.57255 14.1486 6.62984 14.2288 6.71387 14.2823C6.79789 14.3358 6.88574 14.3625 6.97741 14.3625C7.06908 14.3625 7.15692 14.3319 7.24095 14.2708C7.32498 14.2097 7.38227 14.1257 7.41283 14.0188L9.38366 7.46458C9.41421 7.34236 9.41039 7.22014 9.3722 7.09792C9.33401 6.97569 9.27671 6.87639 9.20033 6.8C9.12394 6.72361 9.02463 6.66632 8.90241 6.62813C8.78019 6.58993 8.65796 6.58611 8.53574 6.61667L1.93574 8.5875C1.8288 8.61806 1.74859 8.67535 1.69512 8.75938C1.64164 8.8434 1.61491 8.93125 1.61491 9.02292C1.61491 9.11458 1.63783 9.20243 1.68366 9.28646C1.72949 9.37049 1.80588 9.42778 1.91283 9.45833L3.97533 10.1917L0.308659 13.8583C0.125325 14.0417 0.0336585 14.2556 0.0336585 14.5C0.0336585 14.7444 0.125325 14.9583 0.308659 15.1417L0.858659 15.6917C1.04199 15.875 1.25588 15.9667 1.50033 15.9667C1.74477 15.9667 1.95866 15.875 2.14199 15.6917ZM8.83366 2.58333V1.66667C8.83366 1.40694 8.74581 1.18924 8.57012 1.01354C8.39442 0.837847 8.17671 0.75 7.91699 0.75C7.65727 0.75 7.43956 0.837847 7.26387 1.01354C7.08817 1.18924 7.00033 1.40694 7.00033 1.66667V2.58333C7.00033 2.84306 7.08817 3.06076 7.26387 3.23646C7.43956 3.41215 7.65727 3.5 7.91699 3.5C8.17671 3.5 8.39442 3.41215 8.57012 3.23646C8.74581 3.06076 8.83366 2.84306 8.83366 2.58333ZM4.08991 3.38542L3.42533 2.72083C3.25727 2.55278 3.0472 2.46493 2.79512 2.45729C2.54303 2.44965 2.32533 2.5375 2.14199 2.72083C1.97394 2.88889 1.88609 3.09896 1.87845 3.35104C1.87081 3.60313 1.95102 3.82083 2.11908 4.00417L2.78366 4.69167C2.95171 4.875 3.16178 4.96285 3.41387 4.95521C3.66595 4.94757 3.88366 4.85972 4.06699 4.69167C4.25033 4.50833 4.34581 4.29063 4.35345 4.03854C4.36109 3.78646 4.27324 3.56875 4.08991 3.38542Z" fill="white"/>
                                            </svg>
                                            <a 
                                                href={hotel.hotelDetail.hotelWebsite.url} 
                                                target={hotel.hotelDetail.hotelWebsite.target || "_blank"} 
                                                rel="noopener noreferrer" 
                                                className="text-white hover:text-[#CE0E2D] transition-colors"
                                            >
                                                {hotel.hotelDetail.hotelWebsite.title || "Visit Website"}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex lg:flex-col flex-col-reverse lg:flex-row gap-[20px] mt-[10px] lg:mt-0">
                                    {/* Booking URL */}
                                    {hotel.hotelDetail?.hotelBookingUrl?.url && (
                                        <a 
                                            href={hotel.hotelDetail.hotelBookingUrl.url} 
                                            target={hotel.hotelDetail.hotelBookingUrl.target || "_self"} 
                                            rel="noopener noreferrer" 
                                            className="bg-[#CE0E2D] text-white px-[30px] py-[5px] rounded-0 hover:bg-[#A00B25] transition-colors font-[400] text-[22px] lg:mt-6 mt-[20px] text-center"
                                        >
                                            BOOKING
                                        </a>
                                    )}
                                    
                                    <ShareButtons title={hotel.title} color="#B5B5B8" />
                                    
                                </div>
                            </div>
                        </div>
                        <div className="lg:pl-[60px] order-1 lg:order-2">
                            <div className="lg:aspect-square aspect-auto relative w-full min-h-[250px]">
                                <Image
                                    src={hotel.featuredImage?.node?.sourceUrl || "/img/thumb.jpg"}
                                    alt={hotel.featuredImage?.node?.altText || "Hotel thumbnail"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative">
                    <svg className="absolute top-0 right-0 lg:w-[97px] lg:h-[97px] w-[42px] h-[42px]" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="97" y="62" width="62" height="62" transform="rotate(180 97 62)" fill="#BB0D29"/>
                        <rect x="35" y="97" width="35" height="35" transform="rotate(180 35 97)" fill="#BB0D29"/>
                    </svg>
                    <div className="max-w-[1380px] mx-auto lg:py-[100px] py-[40px] px-[20px]">
                        {/* Hotel Content Repeater */}
                        {hotel.hotelDetail?.hotelContent && hotel.hotelDetail.hotelContent.length > 0 && (
                            <>
                                {/* Mobile Accordion */}
                                <div className="lg:hidden">
                                    {hotel.hotelDetail.hotelContent.map((contentItem, index) => (
                                        <div key={index} className="border-b border-[#161616]">
                                            <input 
                                                type="checkbox" 
                                                id={`accordion-${index}`}
                                                className="hidden"
                                                defaultChecked={index === 0}
                                            />
                                            <label
                                                htmlFor={`accordion-${index}`}
                                                className="w-full flex justify-between items-center py-[20px] px-0 text-left cursor-pointer"
                                            >
                                                {contentItem.contentTitle && (
                                                    <h2 className="text-[30px] font-[500] text-[#090909] leading-[1.1] pr-[20px]">
                                                        {contentItem.contentTitle}
                                                    </h2>
                                                )}
                                                <svg
                                                    className="w-[24px] h-[24px] transition-all duration-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    {/* Plus icon (default state) */}
                                                    <path
                                                        className="plus-icon"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 5v14M5 12h14"
                                                    />
                                                    {/* Minus icon (hidden by default) */}
                                                    <path
                                                        className="minus-icon"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 12h14"
                                                    />
                                                </svg>
                                            </label>
                                            
                                            <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                                                {contentItem.hotelContent && (
                                                    <div className="pb-[20px]">
                                                        <div 
                                                            className="text-[#454545] text-[20px] font-[400] leading-[1.4] entry-content"
                                                            dangerouslySetInnerHTML={{ __html: contentItem.hotelContent }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Desktop Grid */}
                                <div className="hidden lg:grid grid-cols-2 gap-[100px] entry-content">
                                    {hotel.hotelDetail.hotelContent.map((contentItem, index) => (
                                        <div key={index}>
                                            {contentItem.contentTitle && (
                                                <h2 className="text-[39px] font-[500] text-[#161616] mb-[30px] leading-[1.1]">
                                                    {contentItem.contentTitle}
                                                </h2>
                                            )}
                                            {contentItem.hotelContent && (
                                                <div 
                                                    className="text-[#454545] text-[25px] font-[400] leading-[1.4]"
                                                    dangerouslySetInnerHTML={{ __html: contentItem.hotelContent }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        {/* Hotel Gallery */}
                        {hotel.hotelDetail?.hotelGallery?.nodes && hotel.hotelDetail.hotelGallery.nodes.length > 0 ? (
                            <div className="lg:mt-[20px] mt-[25px] mr-[-20px] ml-[-20px] lg:mr-[0px] lg:ml-[0px]">
                                <GallerySwiper images={hotel.hotelDetail.hotelGallery.nodes} />
                            </div>
                        ) : (
                            <div className="mt-[20px]">
                                <div>No images found in this gallery.</div>
                            </div>
                        )}

                        {/* Hotel Map */}
                        {hotel.hotelDetail?.hotelMapIframe && (
                            <div className="mt-[20px] content-map">
                                <div className="w-full lg:h-[500px] h-[300px] min-w-full overflow-hidden"    dangerouslySetInnerHTML={{ __html: hotel.hotelDetail.hotelMapIframe }} />
                            </div>
                        )}
                    </div>
                </div>
            </article>

            <ScriptLoader scripts={hotel.greenshiftScripts} />
        </div>
    );
}
