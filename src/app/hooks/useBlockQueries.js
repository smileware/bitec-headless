'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
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
    GetPageWithDisplayGalleryByType,
    GetGalleriesByTypes,
    GetAllHotels,
    GetAllCategories
} from '../lib/block';
import { getFilteredEvents, getAllEventCategories, getAllEventYears } from '../lib/event';

// Helper to get slug and language from pathname
function useSlugAndLanguage() {
    const pathname = usePathname();
    const path = pathname.replace(/^\/|\/$/g, "");
    const parts = path.split("/").filter(Boolean);
    const hasLangPrefix = parts[0] === "th";
    const isTH = hasLangPrefix;
    const slug = hasLangPrefix ? (parts.slice(1).join("/") || "home") : (path || "home");
    return { slug, isTH };
}

// Hook for Event Hall Carousel
export function useEventHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['eventHallCarousel', slug, isTH],
        queryFn: () => GetPageWithEventHallCarousel(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Bitec Live Hall Carousel
export function useBitecLiveHallCarousel() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['bitecLiveHallCarousel', slug, isTH],
        queryFn: () => GetPageWithBitecLiveHallCarousel(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Hotels
export function useHotels(limit = 8) {
    return useQuery({
        queryKey: ['hotels', limit],
        queryFn: () => GetHotels(limit),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Query Gallery By Type
export function useQueryGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['queryGalleryByType', slug, isTH],
        queryFn: () => GetPageWithQueryGalleryByType(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Gallery Items by Taxonomy
export function useGalleryByTaxonomyType(taxonomySlug, limit = 5, enabled = true) {
    return useQuery({
        queryKey: ['galleryByTaxonomy', taxonomySlug, limit],
        queryFn: () => GetGalleryByTaxonomyType(taxonomySlug, limit),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
        enabled: enabled && !!taxonomySlug, // Only fetch if enabled and taxonomySlug exists
    });
}

// Hook for Photo Gallery
export function usePhotoGallery() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['photoGallery', slug, isTH],
        queryFn: () => GetPageWithPhotoGallery(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Bitec Live Facilities
export function useBitecLiveFacilities() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['bitecLiveFacilities', slug, isTH],
        queryFn: () => GetPageWithBitecLiveFacilities(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Bitec Live Gallery
export function useBitecLiveGallery() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['bitecLiveGallery', slug, isTH],
        queryFn: () => GetPageWithBitecLiveGallery(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Simple Gallery Carousel
export function useSimpleGalleryCarousel() {
    const { slug } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['simpleGalleryCarousel', slug],
        queryFn: () => GetPageWithSimpleGalleryCarousel(slug),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Tab Accordion
export function useTabAccordion(slug = 'plan-and-event') {
    return useQuery({
        queryKey: ['tabAccordion', slug],
        queryFn: () => GetPageWithTabToAccordion(slug),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Display Gallery By Type
export function useDisplayGalleryByType() {
    const { slug, isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['displayGalleryByType', slug, isTH],
        queryFn: () => GetPageWithDisplayGalleryByType(slug, isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Galleries By Types
export function useGalleriesByTypes(typeSlugs, limit = 1000, enabled = true) {
    return useQuery({
        queryKey: ['galleriesByTypes', typeSlugs, limit],
        queryFn: () => GetGalleriesByTypes(typeSlugs, limit),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
        enabled: enabled, // Allow query even if typeSlugs is null (GetGalleriesByTypes handles null by fetching all)
    });
}

// Hook for All Hotels (for HotelMapBlock)
export function useAllHotels() {
    const { isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['allHotels', isTH],
        queryFn: () => GetAllHotels(isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for All Categories (for HotelMapBlock)
export function useAllCategories() {
    const { isTH } = useSlugAndLanguage();
    
    return useQuery({
        queryKey: ['allCategories', isTH],
        queryFn: () => GetAllCategories(isTH),
        staleTime: 10 * 60 * 1000, // 10 minutes - longer cache to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Filtered Events (for WhatsOnBlock)
export function useFilteredEvents(filters = {}, enabled = true) {
    // Use specific filter values in queryKey to prevent unnecessary re-fetches
    const queryKey = [
        'filteredEvents',
        filters.categoryId,
        filters.eventType,
        filters.month,
        filters.year,
        filters.page,
        filters.perPage
    ];
    
    return useQuery({
        queryKey: queryKey,
        queryFn: () => getFilteredEvents(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes for events - longer to reduce server load
        refetchOnMount: false, // Don't refetch if cached data exists
        enabled: enabled,
    });
}

// Hook for Event Categories
export function useEventCategories() {
    return useQuery({
        queryKey: ['eventCategories'],
        queryFn: () => getAllEventCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

// Hook for Event Years
export function useEventYears() {
    return useQuery({
        queryKey: ['eventYears'],
        queryFn: () => getAllEventYears(),
        staleTime: 10 * 60 * 1000, // 10 minutes (years don't change often)
        refetchOnMount: false, // Don't refetch if cached data exists
    });
}

