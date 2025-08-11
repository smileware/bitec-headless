import { getPageBySlug } from './lib/api';
import ScriptLoader from './components/ScriptLoader';
import BlockRenderer from './components/BlockRenderer';

export async function generateMetadata() {
  const page = await getPageBySlug('/', null);
  if (!page) return {};

  const title = page.title || 'Home';
  const description = ((page.content || '')
    .replace(/<[^>]*>/g, '')
    .trim() || '').slice(0, 160);
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
}

export default async function Home() {
    const page = await getPageBySlug('/', null);

    if (!page) {
        return <div>Page not found</div>;
    }

    return (
        <main>
            {page.greenshiftInlineCss && (
                <style dangerouslySetInnerHTML={{ __html: page.greenshiftInlineCss }} />
            )}
            
            <BlockRenderer content={page.content} />

            <ScriptLoader scripts={page.greenshiftScripts} />
        </main>
    );
}