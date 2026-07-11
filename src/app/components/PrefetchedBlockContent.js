import { HydrationBoundary } from '@tanstack/react-query';
import { getDehydratedBlockState } from '../lib/prefetchBlockQueries';
import BlockRenderer from './BlockRenderer';
import ScriptLoader from './ScriptLoader';

/**
 * Async server child: prefetches block queries then hydrates.
 * Must be the only BlockRenderer path for a page (do not Suspense-fallback
 * another BlockRenderer without HydrationBoundary — that causes hydration mismatches).
 */
export default async function PrefetchedBlockContent({
  content,
  slug,
  isTH,
  language,
  scripts,
}) {
  const dehydratedState = await getDehydratedBlockState({
    content,
    slug,
    isTH,
    language,
  });

  return (
    <>
      <HydrationBoundary state={dehydratedState}>
        <BlockRenderer content={content} />
      </HydrationBoundary>
      <ScriptLoader scripts={scripts} />
    </>
  );
}
