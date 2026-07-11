import { QueryClient, dehydrate } from '@tanstack/react-query';
import { detectBlockIds } from './detectBlocks';
import { defaultQueryOptions, BLOCK_QUERY_STALE_TIME, EVENTS_QUERY_STALE_TIME } from './queryDefaults';
import {
  GetPageWithEventHallCarousel,
  GetPageWithBitecLiveHallCarousel,
  GetHotels,
  GetPageWithQueryGalleryByType,
  GetPageWithPhotoGallery,
  GetPageWithBitecLiveFacilities,
  GetPageWithBitecLiveGallery,
  GetPageWithSimpleGalleryCarousel,
  GetPageWithTabToAccordion,
  GetPageWithRetailInformation,
  GetPageWithDisplayGalleryByType,
  GetRecommendedHotels,
  GetAllHotels,
  GetAllCategories,
} from './block';
import {
  getRecentEvents,
  getRecentBitecLiveEvents,
  getFilteredEvents,
  getAllEventCategories,
  getAllEventYears,
} from './event';
import {
  getNewsActivityContent,
  getNewsActivitySustainability,
} from './news-activity';

/**
 * Build prefetch jobs for detected blocks.
 * queryKey / queryFn must match useBlockQueries.js exactly.
 *
 * @param {{ slug: string, isTH: boolean, language: string }} ctx
 * @param {Set<string>} blockIds
 * @returns {Array<{ queryKey: unknown[], queryFn: Function, staleTime?: number }>}
 */
function buildPrefetchJobs(ctx, blockIds) {
  const { slug, isTH, language } = ctx;
  const jobs = [];
  const seen = new Set();

  const add = (queryKey, queryFn, staleTime = BLOCK_QUERY_STALE_TIME) => {
    const key = JSON.stringify(queryKey);
    if (seen.has(key)) return;
    seen.add(key);
    jobs.push({ queryKey, queryFn, staleTime });
  };

  // --- Phase 2: simple CPT / list blocks ---
  if (blockIds.has('block-event-carousel')) {
    add(['recentEvents', 9], () => getRecentEvents(9));
  }

  if (blockIds.has('block-bitec-live-carousel')) {
    add(
      ['recentBitecLiveEvents', 'Bitec Live', 9],
      () => getRecentBitecLiveEvents('Bitec Live', 9)
    );
  }

  if (blockIds.has('block-query-hotel-carousel')) {
    add(['hotels', 8], () => GetHotels(8));
  }

  if (blockIds.has('block-recommended-hotel-carousel')) {
    add(['recommendedHotels', 8, isTH], () => GetRecommendedHotels(8, isTH));
  }

  if (blockIds.has('block-news-activity')) {
    add(
      ['newsActivity', 1, language, 'news', 9],
      () => getNewsActivityContent(1, 9, language, 'news')
    );
  }

  if (blockIds.has('block-news-activity-sustainability')) {
    add(
      ['newsActivitySustainability', 1, language, 6],
      () => getNewsActivitySustainability(1, 6, language)
    );
  }

  if (blockIds.has('block-whats-on')) {
    // Matches WhatsOnBlock initial state: isMobile=false → perPage 12
    const defaultFilters = {
      categoryId: null,
      eventType: 'upcoming',
      month: null,
      year: null,
      page: 1,
      perPage: 12,
    };
    add(
      [
        'filteredEvents',
        defaultFilters.categoryId,
        defaultFilters.eventType,
        defaultFilters.month,
        defaultFilters.year,
        defaultFilters.page,
        defaultFilters.perPage,
      ],
      () => getFilteredEvents(defaultFilters),
      EVENTS_QUERY_STALE_TIME
    );
    add(['eventCategories'], () => getAllEventCategories());
    add(['eventYears'], () => getAllEventYears());
  }

  // --- Phase 3: ACF GetPageWith* / map ---
  if (blockIds.has('block-event-hall-carousel')) {
    add(['eventHallCarousel', slug, isTH], () =>
      GetPageWithEventHallCarousel(slug, isTH)
    );
  }

  if (blockIds.has('block-bitec-live-hall-carousel')) {
    add(['bitecLiveHallCarousel', slug, isTH], () =>
      GetPageWithBitecLiveHallCarousel(slug, isTH)
    );
  }

  if (blockIds.has('block-retail-information')) {
    add(['retailInformation', slug, isTH], () =>
      GetPageWithRetailInformation(slug, isTH)
    );
  }

  if (blockIds.has('block-photo-gallery')) {
    add(['photoGallery', slug, isTH], () =>
      GetPageWithPhotoGallery(slug, isTH)
    );
  }

  if (blockIds.has('block-simple-gallery-carousel')) {
    add(['simpleGalleryCarousel', slug], () =>
      GetPageWithSimpleGalleryCarousel(slug)
    );
  }

  if (blockIds.has('block-bitec-live-gallery')) {
    add(['bitecLiveGallery', slug, isTH], () =>
      GetPageWithBitecLiveGallery(slug, isTH)
    );
  }

  if (blockIds.has('block-bitec-live-facilities')) {
    add(['bitecLiveFacilities', slug, isTH], () =>
      GetPageWithBitecLiveFacilities(slug, isTH)
    );
  }

  if (blockIds.has('block-query-gallery-by-type')) {
    // Config only; dependent taxonomy fetch stays client-side
    add(['queryGalleryByType', slug, isTH], () =>
      GetPageWithQueryGalleryByType(slug, isTH)
    );
  }

  if (blockIds.has('block-display-gallery')) {
    add(['displayGalleryByType', slug, isTH], () =>
      GetPageWithDisplayGalleryByType(slug, isTH)
    );
  }

  if (blockIds.has('block-tab-accordion')) {
    add(['tabAccordion', 'plan-and-event'], () =>
      GetPageWithTabToAccordion('plan-and-event')
    );
  }

  if (blockIds.has('block-hotel-map')) {
    add(['allHotels', isTH], () => GetAllHotels(isTH));
    add(['allCategories', isTH], () => GetAllCategories(isTH));
  }

  return jobs;
}

/**
 * Prefetch block queries into a QueryClient. Fail-open: errors are logged,
 * page still renders; cold queries fall back to client fetch.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {{ content: string, slug: string, isTH: boolean, language: string }} options
 */
export async function prefetchBlockQueries(queryClient, { content, slug, isTH, language }) {
  const blockIds = detectBlockIds(content);
  if (blockIds.size === 0) {
    return;
  }

  const jobs = buildPrefetchJobs({ slug, isTH, language }, blockIds);
  if (jobs.length === 0) {
    return;
  }

  // Cap wait so slow WP block queries cannot block streaming for many seconds.
  // Whatever finished in time is dehydrated; the rest fall back to client fetch.
  const budgetMs = parseInt(process.env.BLOCK_PREFETCH_BUDGET_MS || '2000', 10);

  const prefetchAll = Promise.allSettled(
    jobs.map(({ queryKey, queryFn, staleTime }) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      })
    )
  ).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          '[prefetchBlockQueries] Failed:',
          jobs[index].queryKey,
          result.reason
        );
      }
    });
  });

  await Promise.race([
    prefetchAll,
    new Promise((resolve) => setTimeout(resolve, budgetMs)),
  ]);
}

/**
 * Create a server QueryClient, prefetch detected blocks, return dehydrated state.
 */
export async function getDehydratedBlockState({ content, slug, isTH, language }) {
  const queryClient = new QueryClient({
    defaultOptions: defaultQueryOptions,
  });

  await prefetchBlockQueries(queryClient, { content, slug, isTH, language });

  return dehydrate(queryClient);
}
