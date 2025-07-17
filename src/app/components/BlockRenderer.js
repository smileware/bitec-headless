'use client';

import parse from 'html-react-parser';
import EventCarouselBlock from './block/EventCarouselBlock';
import NewsActivityBlock from './block/NewsActivityBlock';
import WhatsOnBlock from './block/WhatsOnBlock';

export default function BlockRenderer({ content }) {
    
    if (!content || typeof content !== 'string') {
        return null;
    }

    const replace = (domNode) => {
        if (domNode.attribs?.id === 'block-event-carousel') {
            return <EventCarouselBlock {...domNode.attribs} />;
        }
        if (domNode.attribs?.id === 'block-news-activity') {
            return <NewsActivityBlock {...domNode.attribs} />;
        }
        if (domNode.attribs?.id === 'block-whats-on') {
            return <WhatsOnBlock {...domNode.attribs} />;
        }
        

        return undefined;
    };
    const parsed = parse(content, { replace });
    return parsed;
}
