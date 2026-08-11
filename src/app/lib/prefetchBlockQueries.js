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
} from './eventContent';
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
 * @returns {Array<{ queryKey: unknown[], queryFn: Function, staleTime?: number, deferToClient?: boolean }>}
 */
function buildPrefetchJobs(ctx, blockIds) {
  const { slug, isTH, language } = ctx;
  const jobs = [];
  const seen = new Set();

  const add = (
    queryKey,
    queryFn,
    staleTime = BLOCK_QUERY_STALE_TIME,
    deferToClient = false
  ) => {
    const key = JSON.stringify(queryKey);
    if (seen.has(key)) return;
    seen.add(key);
    jobs.push({ queryKey, queryFn, staleTime, deferToClient });
  };

  // --- Phase 2: simple CPT / list blocks ---
  if (blockIds.has('block-event-carousel')) {
    add(['recentEvents', 9, language], ({ signal }) =>
      getRecentEvents(9, { signal, language })
    );
  }

  if (blockIds.has('block-bitec-live-carousel')) {
    add(
      ['recentBitecLiveEvents', 'Bitec Live', 9, language],
      ({ signal }) => getRecentBitecLiveEvents(
        'Bitec Live',
        9,
        { signal, language }
      )
    );
  }

  if (blockIds.has('block-query-hotel-carousel')) {
    add(['hotels', 8], ({ signal }) =>
      GetHotels(8, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-recommended-hotel-carousel')) {
    add(['recommendedHotels', 8, isTH], ({ signal }) =>
      GetRecommendedHotels(8, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-news-activity')) {
    add(
      ['newsActivity', 1, language, 'news', 9],
      () => getNewsActivityContent(1, 9, language, 'news'),
      BLOCK_QUERY_STALE_TIME,
      true
    );
  }

  if (blockIds.has('block-news-activity-sustainability')) {
    add(
      ['newsActivitySustainability', 1, language, 6],
      () => getNewsActivitySustainability(1, 6, language),
      BLOCK_QUERY_STALE_TIME,
      true
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
        language,
      ],
      ({ signal }) => getFilteredEvents(defaultFilters, { signal, language }),
      EVENTS_QUERY_STALE_TIME
    );
    add(['eventCategories', language], ({ signal }) =>
      getAllEventCategories({ signal, language })
    );
    add(['eventYears', language], ({ signal }) =>
      getAllEventYears({ signal, language })
    );
  }

  // --- Phase 3: ACF GetPageWith* / map ---
  if (blockIds.has('block-event-hall-carousel')) {
    add(['eventHallCarousel', slug, isTH], ({ signal }) =>
      GetPageWithEventHallCarousel(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-bitec-live-hall-carousel')) {
    add(['bitecLiveHallCarousel', slug, isTH], ({ signal }) =>
      GetPageWithBitecLiveHallCarousel(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-retail-information')) {
    add(['retailInformation', slug, isTH], ({ signal }) =>
      GetPageWithRetailInformation(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-photo-gallery')) {
    add(['photoGallery', slug, isTH], ({ signal }) =>
      GetPageWithPhotoGallery(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-simple-gallery-carousel')) {
    add(['simpleGalleryCarousel', slug], ({ signal }) =>
      GetPageWithSimpleGalleryCarousel(slug, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-bitec-live-gallery')) {
    add(['bitecLiveGallery', slug, isTH], ({ signal }) =>
      GetPageWithBitecLiveGallery(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-bitec-live-facilities')) {
    add(['bitecLiveFacilities', slug, isTH], ({ signal }) =>
      GetPageWithBitecLiveFacilities(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-query-gallery-by-type')) {
    // Config only; dependent taxonomy fetch stays client-side
    add(['queryGalleryByType', slug, isTH], ({ signal }) =>
      GetPageWithQueryGalleryByType(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-display-gallery')) {
    add(['displayGalleryByType', slug, isTH], ({ signal }) =>
      GetPageWithDisplayGalleryByType(slug, isTH, { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-tab-accordion')) {
    add(['tabAccordion', 'plan-and-event'], ({ signal }) =>
      GetPageWithTabToAccordion('plan-and-event', { signal, throwOnError: true })
    );
  }

  if (blockIds.has('block-hotel-map')) {
    add(['allHotels', isTH], ({ signal }) =>
      GetAllHotels(isTH, { signal, throwOnError: true })
    );
    add(['allCategories', isTH], ({ signal }) =>
      GetAllCategories(isTH, { signal, throwOnError: true })
    );
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

  // Dynamic archives already have same-origin CDN-cached API routes. Starting
  // their GraphQL queries here and abandoning the wait after the budget expires
  // leaves the PHP work running, while hydration starts a second identical API
  // request in the browser. Defer those jobs so exactly one origin request runs.
  const serverJobs = jobs.filter((job) => !job.deferToClient);
  if (serverJobs.length === 0) {
    return;
  }

  // Cap wait so slow WP block queries cannot block streaming for many seconds.
  // Whatever finished in time is dehydrated; the rest fall back to client fetch.
  const budgetMs = parseInt(process.env.BLOCK_PREFETCH_BUDGET_MS || '1500', 10);

  const prefetchAll = Promise.allSettled(
    serverJobs.map(({ queryKey, queryFn, staleTime }) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      })
    )
  ).then((results) => {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        if (result.reason?.name !== 'AbortError') {
          console.error('[block-prefetch] outcome=error');
        }
      }
    });
  });

  let timedOut = false;
  let timer;
  await Promise.race([
    prefetchAll,
    new Promise((resolve) => {
      timer = setTimeout(() => {
        timedOut = true;
        resolve();
      }, budgetMs);
    }),
  ]);
  clearTimeout(timer);

  if (timedOut) {
    await Promise.all(
      serverJobs.map(({ queryKey }) =>
        queryClient.cancelQueries({ queryKey, exact: true })
      )
    );
    await prefetchAll;
  }
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
