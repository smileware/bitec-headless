'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import EventCard from '../ui/EventCard';
import Skeleton from '../ui/Skeleton';
import { useRecentBitecLiveEvents } from '../../hooks/useBlockQueries';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function BitecLiveCarouselBlock(props) {
  const { data, isLoading } = useRecentBitecLiveEvents('Bitec Live', 9);
  const events = data ?? [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading && data === undefined) {
    return (
      <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
        <div className="gs-swiper-init">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((key) => (
              <div key={key} className="p-4 bg-white">
                <Skeleton width="w-full" height="h-48" rounded="rounded-md" className="mb-3" />
                <Skeleton width="w-3/4" height="h-6" className="mb-2" />
                <Skeleton width="w-1/2" height="h-4" className="mb-2" />
                <Skeleton width="w-full" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
        <div className="gs-swiper-init">
          <div className="swiper">
            <div className="swiper-wrapper">
              <div className="no-events-message text-center opacity-50">
                No upcoming events found.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
        <div className="gs-swiper-init">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...props} className="wp-block-greenshift-blocks-swiper gs-swiper swiper-event-carousel">
      <div className="gs-swiper-init">
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={3}
          spaceBetween={30}
          speed={400}
          loop={false}
          autoHeight={false}
          grabCursor={false}
          freeMode={false}
          centeredSlides={false}
          autoplay={false}
          breakpoints={{
            320: { slidesPerView: 1.1, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            el: '.swiper-pagination',
            clickable: true,
          }}
          className="swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id}>
              <EventCard event={event} />
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
        </Swiper>

        <div className="swiper-button-prev">
          <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.6666 6.66671H3.52492L8.18325 2.00837L6.99992 0.833374L0.333252 7.50004L6.99992 14.1667L8.17492 12.9917L3.52492 8.33337H13.6666V6.66671Z"/>
          </svg>
        </div>
        <div className="swiper-button-next">
          <svg width="14" height="15" viewBox="0 0 14 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.99992 0.833374L5.82492 2.00837L10.4749 6.66671H0.333252V8.33337H10.4749L5.82492 12.9917L6.99992 14.1667L13.6666 7.50004L6.99992 0.833374Z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
