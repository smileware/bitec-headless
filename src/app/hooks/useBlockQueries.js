'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { getSlugAndLanguageFromPathname } from '../lib/pageContext';
import { BLOCK_QUERY_STALE_TIME, EVENTS_QUERY_STALE_TIME } from '../lib/queryDefaults';
import { fetchContentApi } from '../lib/clientContentApi';

function getNewsActivityQuery(page, perPage, language, filter, signal) {
    return fetchContentApi('/api/content/news', {
        page,
        perPage,
        language,
        filter,
    }, { signal });
}

function getSustainabilityQuery(page, perPage, language, signal) {
    return fetchContentApi('/api/content/news', {
        type: 'sustainability',
        page,
        perPage,
        language,
    }, { signal });
}

function getEventsQuery(mode, params, signal) {
    return fetchContentApi('/api/content/events', { mode, ...params }, { signal });
}

function getHotelsQuery(mode, params, signal) {
    return fetchContentApi('/api/content/hotels', { mode, ...params }, { signal });
}

function getPageBlockQuery(operation, params, signal) {
    return fetchContentApi(
        '/api/content/page-blocks',
        { operation, ...params },
        { signal }
    );
}

function useSlugAndLanguage() {
    const pathname = usePathname();
    return getSlugAndLanguageFromPathname(pathname);
}

export function useRecentEvents(limit = 9) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['recentEvents', limit, language],
        queryFn: ({ signal }) => getEventsQuery('recent', { limit, language }, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useRecentBitecLiveEvents(locationId = 'Bitec Live', limit = 9) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['recentBitecLiveEvents', locationId, limit, language],
        queryFn: ({ signal }) => getEventsQuery(
            'bitec-live',
            { locationId, limit, language },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useRecommendedHotels(limit = 8) {
    const { isTH } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['recommendedHotels', limit, isTH],
        queryFn: ({ signal }) => getHotelsQuery(
            'recommended',
            { limit, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useNewsActivity(page = 1, filter = 'news', perPage = 9) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['newsActivity', page, language, filter, perPage],
        queryFn: ({ signal }) => getNewsActivityQuery(page, perPage, language, filter, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useNewsActivitySustainability(page = 1, perPage = 6) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['newsActivitySustainability', page, language, perPage],
        queryFn: ({ signal }) => getSustainabilityQuery(page, perPage, language, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useEventHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['eventHallCarousel', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'event-hall-carousel',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useBitecLiveHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveHallCarousel', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'bitec-live-hall-carousel',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useHotels(limit = 8) {
    return useQuery({
        queryKey: ['hotels', limit],
        queryFn: ({ signal }) => getHotelsQuery('list', { limit }, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useQueryGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['queryGalleryByType', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'query-gallery-by-type',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useGalleryByTaxonomyType(taxonomySlug, limit = 5, enabled = true) {
    return useQuery({
        queryKey: ['galleryByTaxonomy', taxonomySlug, limit],
        queryFn: ({ signal }) => fetchContentApi('/api/content/galleries', {
                slug: taxonomySlug,
                limit,
            }, { signal }),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled: enabled && !!taxonomySlug,
        retry: 0,
    });
}

export function usePhotoGallery() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['photoGallery', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'photo-gallery',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useBitecLiveFacilities() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveFacilities', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'bitec-live-facilities',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useBitecLiveGallery() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveGallery', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'bitec-live-gallery',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useSimpleGalleryCarousel() {
    const { slug } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['simpleGalleryCarousel', slug],
        queryFn: ({ signal }) => getPageBlockQuery(
            'simple-gallery-carousel',
            { slug },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useTabAccordion(slug = 'plan-and-event') {
    return useQuery({
        queryKey: ['tabAccordion', slug],
        queryFn: ({ signal }) => getPageBlockQuery(
            'tab-accordion',
            { slug },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useDisplayGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['displayGalleryByType', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'display-gallery-by-type',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useGalleriesByTypes(typeSlugs, page = 1, perPage = 12, enabled = true) {
    return useQuery({
        queryKey: ['galleriesByTypes', typeSlugs, page, perPage],
        queryFn: ({ signal }) => fetchContentApi('/api/content/galleries', {
                mode: 'types',
                typeSlugs: typeSlugs?.join(',') || null,
                page,
                perPage,
            }, { signal }),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled,
        retry: 0,
    });
}

export function useAllHotels() {
    const { isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['allHotels', isTH],
        queryFn: ({ signal }) => getHotelsQuery(
            'all',
            { language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useAllCategories() {
    const { isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['allCategories', isTH],
        queryFn: ({ signal }) => getHotelsQuery(
            'categories',
            { language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useFilteredEvents(filters = {}, enabled = true) {
    const { language } = useSlugAndLanguage();
    const queryKey = [
        'filteredEvents',
        filters.categoryId,
        filters.eventType,
        filters.month,
        filters.year,
        filters.page,
        filters.perPage,
        language,
    ];

    return useQuery({
        queryKey,
        queryFn: ({ signal }) => getEventsQuery(
            'filtered',
            { ...filters, language },
            signal
        ),
        staleTime: EVENTS_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled,
        retry: 0,
    });
}

export function useEventCategories() {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['eventCategories', language],
        queryFn: ({ signal }) => getEventsQuery('categories', { language }, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useEventYears() {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['eventYears', language],
        queryFn: ({ signal }) => getEventsQuery('years', { language }, signal),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}

export function useRetailInformation() {
    const { slug, isTH } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['retailInformation', slug, isTH],
        queryFn: ({ signal }) => getPageBlockQuery(
            'retail-information',
            { slug, language: isTH ? 'th' : 'en' },
            signal
        ),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        retry: 0,
    });
}
