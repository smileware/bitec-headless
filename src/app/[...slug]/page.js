import { Suspense } from 'react';
import { getPageBySlug } from '../lib/api';
import { resolvePageContext } from '../lib/pageContext';
import PrefetchedBlockContent from '../components/PrefetchedBlockContent';
import PageContentFallback from '../components/layout/PageContentFallback';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const languageCodes = ['th', 'en'];
  let actualSlug;
  let language;
  if (Array.isArray(slug) && slug.length > 0) {
    if (languageCodes.includes(slug[0])) {
      language = slug[0];
      actualSlug = slug.length === 1 ? '/' : slug.slice(1).join('/');
    } else {
      language = null;
      actualSlug = slug.join('/');
    }
  } else {
    actualSlug = '/';
    language = null;
  }

  try {
    const page = await getPageBySlug(actualSlug, language);
    if (!page) return { title: 'BITEC' };

    const title =
      (language === 'th' && page.translations?.[0]?.title) ||
      page.title ||
      'Page';
    const rawContent =
      (language === 'th' && page.translations?.[0]?.content) ||
      page.content ||
      '';
    const description = (rawContent.replace(/<[^>]*>/g, '').trim() || '').slice(
      0,
      160
    );
    const image = page.featuredImage?.node?.sourceUrl;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        title,
        description,
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: 'BITEC' };
  }
}

async function DynamicPageContent({ params }) {
  const { slug } = await params;

  let actualSlug;
  let language;
  const languageCodes = ['th', 'en'];

  if (Array.isArray(slug) && slug.length > 0) {
    if (languageCodes.includes(slug[0])) {
      language = slug[0];
      actualSlug = slug.length === 1 ? '/' : slug.slice(1).join('/');
    } else {
      language = null;
      actualSlug = slug.join('/');
    }
  } else {
    actualSlug = '/';
    language = null;
  }

  const page = await getPageBySlug(actualSlug, language);
  if (!page) {
    return (
      <div>
        <h1>Page not found</h1>
        <p>
          Could not find page: {actualSlug} in language:{' '}
          {language || 'default'}
        </p>
      </div>
    );
  }

  let displayBlocks = page.content;
  let displayCss = page.greenshiftInlineCss;
  if (language === 'th' && page.translations && page.translations.length > 0) {
    const translation = page.translations[0];
    displayBlocks = translation.content || page.content;
    displayCss = translation.greenshiftInlineCss || page.greenshiftInlineCss;
  }

  const { slug: pageSlug, isTH, language: lang } = resolvePageContext({
    actualSlug,
    language,
  });

  // Single hydrated tree only — no BlockRenderer Suspense fallback without RQ state.
  return (
    <div>
      {displayCss && (
        <style dangerouslySetInnerHTML={{ __html: displayCss }} />
      )}
      <PrefetchedBlockContent
        content={displayBlocks}
        slug={pageSlug}
        isTH={isTH}
        language={lang}
        scripts={page.greenshiftScripts}
      />
    </div>
  );
}

export default function DynamicPage({ params }) {
  return (
    <Suspense fallback={<PageContentFallback />}>
      <DynamicPageContent params={params} />
    </Suspense>
  );
}
