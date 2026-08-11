import { getPageBySlug } from './lib/api';
import { resolvePageContext } from './lib/pageContext';
import PrefetchedBlockContent from './components/PrefetchedBlockContent';

export const revalidate = 7200;

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
  // Render content directly (no Suspense boundary). On this setup the client
  // never completes the Suspense reveal — content stays stranded in a hidden
  // `#S:n` placeholder (accordions unclickable, footer empty). Awaiting directly
  // is the only configuration where content actually renders. ISR caches the
  // result so warm pages stay fast; footer parallelism is handled in layout.js.
  return <HomeContent />;
}
