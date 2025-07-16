'use client';

import parse from 'html-react-parser';
import EventCarouselBlock from './block/EventCarouselBlock';

export default function BlockRenderer({ content }) {
    
    if (!content || typeof content !== 'string') {
        return null;
    }

    const replace = (domNode) => {
        if (domNode.attribs?.id === 'block-event-carousel') {
            return <EventCarouselBlock {...domNode.attribs} />;
        }
        
        return undefined;
    };
    const parsed = parse(content, { replace });
    return parsed;
}
