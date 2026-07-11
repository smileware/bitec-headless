'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { getSlugAndLanguageFromPathname } from '../lib/pageContext';
import { BLOCK_QUERY_STALE_TIME, EVENTS_QUERY_STALE_TIME } from '../lib/queryDefaults';
import {
    GetPageWithEventHallCarousel,
    GetPageWithBitecLiveHallCarousel,
    GetHotels,
    GetPageWithQueryGalleryByType,
    GetGalleryByTaxonomyType,
    GetPageWithPhotoGallery,
    GetPageWithBitecLiveFacilities,
    GetPageWithBitecLiveGallery,
    GetPageWithSimpleGalleryCarousel,
    GetPageWithTabToAccordion,
    GetPageWithRetailInformation,
    GetPageWithDisplayGalleryByType,
    GetGalleriesByTypes,
    GetAllHotels,
    GetAllCategories,
    GetRecommendedHotels,
} from '../lib/block';
import {
    getFilteredEvents,
    getAllEventCategories,
    getAllEventYears,
    getRecentEvents,
    getRecentBitecLiveEvents,
} from '../lib/event';
import {
    getNewsActivityContent,
    getNewsActivitySustainability,
} from '../lib/news-activity';

function useSlugAndLanguage() {
    const pathname = usePathname();
    return getSlugAndLanguageFromPathname(pathname);
}

export function useRecentEvents(limit = 9) {
    return useQuery({
        queryKey: ['recentEvents', limit],
        queryFn: () => getRecentEvents(limit),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useRecentBitecLiveEvents(locationId = 'Bitec Live', limit = 9) {
    return useQuery({
        queryKey: ['recentBitecLiveEvents', locationId, limit],
        queryFn: () => getRecentBitecLiveEvents(locationId, limit),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useRecommendedHotels(limit = 8) {
    const { isTH } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['recommendedHotels', limit, isTH],
        queryFn: () => GetRecommendedHotels(limit, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useNewsActivity(page = 1, filter = 'news', perPage = 9) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['newsActivity', page, language, filter, perPage],
        queryFn: () => getNewsActivityContent(page, perPage, language, filter),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useNewsActivitySustainability(page = 1, perPage = 6) {
    const { language } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['newsActivitySustainability', page, language, perPage],
        queryFn: () => getNewsActivitySustainability(page, perPage, language),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useEventHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['eventHallCarousel', slug, isTH],
        queryFn: () => GetPageWithEventHallCarousel(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useBitecLiveHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveHallCarousel', slug, isTH],
        queryFn: () => GetPageWithBitecLiveHallCarousel(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useHotels(limit = 8) {
    return useQuery({
        queryKey: ['hotels', limit],
        queryFn: () => GetHotels(limit),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useQueryGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['queryGalleryByType', slug, isTH],
        queryFn: () => GetPageWithQueryGalleryByType(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useGalleryByTaxonomyType(taxonomySlug, limit = 5, enabled = true) {
    return useQuery({
        queryKey: ['galleryByTaxonomy', taxonomySlug, limit],
        queryFn: () => GetGalleryByTaxonomyType(taxonomySlug, limit),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled: enabled && !!taxonomySlug,
    });
}

export function usePhotoGallery() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['photoGallery', slug, isTH],
        queryFn: () => GetPageWithPhotoGallery(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useBitecLiveFacilities() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveFacilities', slug, isTH],
        queryFn: () => GetPageWithBitecLiveFacilities(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useBitecLiveGallery() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['bitecLiveGallery', slug, isTH],
        queryFn: () => GetPageWithBitecLiveGallery(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useSimpleGalleryCarousel() {
    const { slug } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['simpleGalleryCarousel', slug],
        queryFn: () => GetPageWithSimpleGalleryCarousel(slug),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useTabAccordion(slug = 'plan-and-event') {
    return useQuery({
        queryKey: ['tabAccordion', slug],
        queryFn: () => GetPageWithTabToAccordion(slug),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useDisplayGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['displayGalleryByType', slug, isTH],
        queryFn: () => GetPageWithDisplayGalleryByType(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useGalleriesByTypes(typeSlugs, limit = 1000, enabled = true) {
    return useQuery({
        queryKey: ['galleriesByTypes', typeSlugs, limit],
        queryFn: () => GetGalleriesByTypes(typeSlugs, limit),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled,
    });
}

export function useAllHotels() {
    const { isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['allHotels', isTH],
        queryFn: () => GetAllHotels(isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useAllCategories() {
    const { isTH } = useSlugAndLanguage();

    return useQuery({
        queryKey: ['allCategories', isTH],
        queryFn: () => GetAllCategories(isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useFilteredEvents(filters = {}, enabled = true) {
    const queryKey = [
        'filteredEvents',
        filters.categoryId,
        filters.eventType,
        filters.month,
        filters.year,
        filters.page,
        filters.perPage,
    ];

    return useQuery({
        queryKey,
        queryFn: () => getFilteredEvents(filters),
        staleTime: EVENTS_QUERY_STALE_TIME,
        refetchOnMount: false,
        enabled,
    });
}

export function useEventCategories() {
    return useQuery({
        queryKey: ['eventCategories'],
        queryFn: () => getAllEventCategories(),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useEventYears() {
    return useQuery({
        queryKey: ['eventYears'],
        queryFn: () => getAllEventYears(),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}

export function useRetailInformation() {
    const { slug, isTH } = useSlugAndLanguage();
    return useQuery({
        queryKey: ['retailInformation', slug, isTH],
        queryFn: () => GetPageWithRetailInformation(slug, isTH),
        staleTime: BLOCK_QUERY_STALE_TIME,
        refetchOnMount: false,
    });
}
