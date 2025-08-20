'use client';

import parse from 'html-react-parser';
import EventCarouselBlock from './block/EventCarouselBlock';
import NewsActivityBlock from './block/NewsActivityBlock';
import WhatsOnBlock from './block/WhatsOnBlock';
import BitecLiveCarouselBlock from './block/BitecLiveCarouselBlock';
import BitecLiveGalleryBlock from './block/BitecLiveGalleryBlock';
import BitecLiveFacilitiesBlock from './block/BitecLiveFacilitiesBlock';
import QueryGalleryByTypeBlock from './block/QueryGalleryByTypeBlock';
import NewsActivitySustainabilityBlock from './block/NewsActivitySustainabilityBlock';
import TabAccordionBlock from './block/TabAccordionBlock';
import EventHallCarouselBlock from './block/EventHallCarouselBlock';
import BitecLiveHallCarouselBlock from './block/BitecLiveHallCarouselBlock';
import PhotoGalleryBlock from './block/PhotoGalleryBlock';
import QueryHotelCarouselBlock from './block/QueryHotelCarouselBlock';
import RecommendedHotelCarouselBlock from './block/RecommendedHotelCarouselBlock';
import HotelMapBlock from './block/HotelMapBlock';
import SimpleGalleryCarouselBlock from './block/SimpleGalleryCarouselBlock';

export default function BlockRenderer({ content }) {
    
    if (!content || typeof content !== 'string') {
        return null;
    }

    const replace = (domNode) => {
        // Ensure domNode and attribs exist before processing
        if (!domNode || !domNode.attribs) {
            return undefined;
        }

        if (domNode.attribs.id === 'block-event-carousel') {
            return <EventCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-news-activity') {
            return <NewsActivityBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-whats-on') {
            return <WhatsOnBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-bitec-live-carousel') {
            return <BitecLiveCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-bitec-live-gallery') {
            return <BitecLiveGalleryBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-bitec-live-facilities') {
            return <BitecLiveFacilitiesBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-query-gallery-by-type') {
            return <QueryGalleryByTypeBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-news-activity-sustainability') {
            return <NewsActivitySustainabilityBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-tab-accordion') {
            return <TabAccordionBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id?.startsWith('block-event-hall-carousel')) {
            return <EventHallCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-bitec-live-hall-carousel') {
            return <BitecLiveHallCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-photo-gallery') {
            return <PhotoGalleryBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-query-hotel-carousel') {
            return <QueryHotelCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-recommended-hotel-carousel') {
            return <RecommendedHotelCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id === 'block-hotel-map') {
            return <HotelMapBlock {...domNode.attribs} />;
        }
        if (domNode.attribs.id?.startsWith('block-simple-gallery-carousel')) {
            return <SimpleGalleryCarouselBlock {...domNode.attribs} />;
        }
        
        return undefined;
    };

    try {
        const parsed = parse(content, { replace });
        return parsed;
    } catch (error) {
        console.error('Error parsing content in BlockRenderer:', error);
        // Fallback: render the content as-is if parsing fails
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
}
