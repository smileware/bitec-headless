'use client';

import { useEffect } from 'react';

/**
 * Faithful port of GreenShift's own accordion frontend script
 * (`greenshift-animation-and-page-builder-blocks/libs/accordion/index.js`).
 *
 * WordPress only enqueues that script through the theme's normal page render;
 * it does not come through the GraphQL `enqueuedScripts` this headless app reads,
 * so on the Next side the accordions ship as inert markup and never toggle. We
 * replicate GreenShift's exact behaviour instead of loading the remote file, so
 * it works on every page, in both languages, without depending on WP enqueue.
 *
 * Key detail matching GreenShift: the open panel height is set with an inline
 * `max-height: scrollHeight px`, NOT via a CSS `.gsopen` rule. GreenShift's CSS
 * only animates `max-height`; the actual value is applied imperatively here.
 * Closing sets `max-height` back to null. `.togglelogic` accordions collapse
 * their siblings so only one item is open at a time.
 */
function toggle(target) {
    const item = target.closest('.gs-accordion-item');
    if (!item) return;
    const wrapper = target.closest('.gs-accordion');
    if (!wrapper) return;

    const contentWrap = item.querySelector('.gs-accordion-item__content');
    const single = wrapper.classList.contains('togglelogic');

    if (item.classList.contains('gsopen')) {
        // Currently open → close it (and, for single-open, all siblings too).
        if (single) {
            wrapper.querySelectorAll('.gs-accordion-item').forEach((el) => collapse(el));
        } else {
            collapse(item);
        }
        return;
    }

    // Currently closed → open it. For single-open accordions, close the rest first.
    if (single) {
        wrapper.querySelectorAll('.gs-accordion-item').forEach((el) => {
            if (el !== item) collapse(el);
        });
    }
    item.classList.replace('gsclose', 'gsopen');
    if (contentWrap) contentWrap.style.maxHeight = `${contentWrap.scrollHeight}px`;
    setExpanded(item, true);
}

function collapse(item) {
    item.classList.replace('gsopen', 'gsclose');
    setExpanded(item, false);
    const content = item.querySelector('.gs-accordion-item__content');
    if (content) content.style.maxHeight = null;
}

function setExpanded(item, open) {
    const title = item.querySelector('.gs-accordion-item__title');
    if (title) title.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Keep open panels sized correctly when the viewport (and therefore the content
// height) changes — mirrors GreenShift's GSPB_Accordion_MaxHeight on resize.
function resizeOpenPanels() {
    document.querySelectorAll('.gs-accordion-item.gsopen').forEach((item) => {
        const content = item.querySelector('.gs-accordion-item__content');
        if (content) content.style.maxHeight = `${content.scrollHeight}px`;
    });
}

export default function GreenShiftAccordion() {
    useEffect(() => {
        const onClick = (event) => {
            const title =
                event.target.closest &&
                event.target.closest('.gs-accordion-item__title');
            if (title) toggle(title);
        };
        const onKeydown = (event) => {
            if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
            const title =
                event.target.closest &&
                event.target.closest('.gs-accordion-item__title');
            if (!title) return;
            event.preventDefault();
            toggle(title);
        };

        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKeydown);
        window.addEventListener('resize', resizeOpenPanels);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKeydown);
            window.removeEventListener('resize', resizeOpenPanels);
        };
    }, []);

    return null;
}
