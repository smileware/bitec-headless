import { Suspense } from 'react';
import { getPageBySlug } from './lib/api';
import { resolvePageContext } from './lib/pageContext';
import PrefetchedBlockContent from './components/PrefetchedBlockContent';
import PageContentFallback from './components/layout/PageContentFallback';

// No heavy generateMetadata on `/` — layout site metadata paints first.
// getPageBySlug only runs inside HomeContent (behind Suspense).

async function HomeContent() {
  const page = await getPageBySlug('/', null);

  if (!page) {
    return <div>Page not found</div>;
  }

  const { slug, isTH, language } = resolvePageContext({
    actualSlug: '/',
    language: null,
  });

  // Do NOT Suspense BlockRenderer without HydrationBoundary as a fallback —
  // that SSR'd skeletons while the client hydrated with prefetched data.
  return (
    <main>
      {page.greenshiftInlineCss && (
        <style dangerouslySetInnerHTML={{ __html: page.greenshiftInlineCss }} />
      )}
      <PrefetchedBlockContent
        content={page.content}
        slug={slug}
        isTH={isTH}
        language={language}
        scripts={page.greenshiftScripts}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageContentFallback />}>
      <HomeContent />
    </Suspense>
  );
}
