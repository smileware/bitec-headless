'use client';

import { useMemo } from 'react';
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
import GalleryBlock from './block/GalleryBlock';

// Block mapping for efficient lookup - order preserved by array order
const BLOCK_MAP = [
    { id: 'block-event-carousel', component: EventCarouselBlock },
    { id: 'block-news-activity', component: NewsActivityBlock },
    { id: 'block-whats-on', component: WhatsOnBlock },
    { id: 'block-bitec-live-carousel', component: BitecLiveCarouselBlock },
    { id: 'block-bitec-live-gallery', component: BitecLiveGalleryBlock },
    { id: 'block-bitec-live-facilities', component: BitecLiveFacilitiesBlock },
    { id: 'block-query-gallery-by-type', component: QueryGalleryByTypeBlock },
    { id: 'block-news-activity-sustainability', component: NewsActivitySustainabilityBlock },
    { id: 'block-tab-accordion', component: TabAccordionBlock },
    { id: 'block-event-hall-carousel', component: EventHallCarouselBlock, startsWith: true },
    { id: 'block-bitec-live-hall-carousel', component: BitecLiveHallCarouselBlock },
    { id: 'block-photo-gallery', component: PhotoGalleryBlock },
    { id: 'block-query-hotel-carousel', component: QueryHotelCarouselBlock },
    { id: 'block-recommended-hotel-carousel', component: RecommendedHotelCarouselBlock },
    { id: 'block-hotel-map', component: HotelMapBlock },
    { id: 'block-simple-gallery-carousel', component: SimpleGalleryCarouselBlock, startsWith: true },
    { id: 'block-display-gallery', component: GalleryBlock },
];

export default function BlockRenderer({ content }) {
    
    // Memoize the replace function to prevent recreation on every render
    const replace = useMemo(() => {
        return (domNode) => {
            // Ensure domNode and attribs exist before processing
            if (!domNode || !domNode.attribs || !domNode.attribs.id) {
                return undefined;
            }

            const blockId = domNode.attribs.id;

            // First, check for exact matches (more efficient and preserves order)
            for (const block of BLOCK_MAP) {
                if (!block.startsWith && blockId === block.id) {
                    const Component = block.component;
                    return <Component key={blockId} {...domNode.attribs} />;
                }
            }

            // Then, check for startsWith matches (for blocks with dynamic IDs)
            for (const block of BLOCK_MAP) {
                if (block.startsWith && blockId.startsWith(block.id)) {
                    const Component = block.component;
                    return <Component key={blockId} {...domNode.attribs} />;
                }
            }

            return undefined;
        };
    }, []);

    // Memoize parsed content to prevent re-parsing on every render
    const parsedContent = useMemo(() => {
        if (!content || typeof content !== 'string') {
            return null;
        }

        try {
            // Parse with replace function - html-react-parser preserves DOM order by default
            return parse(content, { 
                replace,
                // Preserve order by processing nodes sequentially
                trim: false,
            });
        } catch (error) {
            console.error('Error parsing content in BlockRenderer:', error);
            // Fallback: render the content as-is if parsing fails
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    }, [content, replace]);

    return parsedContent;
}
