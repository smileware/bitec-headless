import { getPageBySlug } from "../lib/api";
import ScriptLoader from '../components/ScriptLoader';
import BlockRenderer from '../components/BlockRenderer';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const languageCodes = ["th", "en"];
  let actualSlug, language;
  if (Array.isArray(slug) && slug.length > 0) {
    if (languageCodes.includes(slug[0])) {
      language = slug[0];
      actualSlug = slug.length === 1 ? "/" : slug.slice(1).join("/");
    } else {
      language = null;
      actualSlug = slug.join("/");
    }
  } else {
    actualSlug = "/";
    language = null;
  }

  const page = await getPageBySlug(actualSlug, language);
  if (!page) return {};

  // Prefer translated title/content if Thai
  const title = (language === 'th' && page.translations?.[0]?.title) || page.title || 'Page';
  const rawContent = (language === 'th' && page.translations?.[0]?.content) || page.content || '';
  const description = (rawContent.replace(/<[^>]*>/g, '').trim() || '').slice(0, 160);
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

export default async function DynamicPage({ params }) {
    const { slug } = await params;

    let actualSlug, language;

    // Available language codes
    const languageCodes = ["th", "en"];

    if (Array.isArray(slug) && slug.length > 0) {
        // Check if first segment is a language code
        if (languageCodes.includes(slug[0])) {
            language = slug[0];

            if (slug.length === 1) {
                actualSlug = "/";
            } else {
                actualSlug = slug.slice(1).join("/");
            }
        } else {
            language = null;
            actualSlug = slug.join("/");
        }
    } else {
        actualSlug = "/";
        language = null;
    }

    // Fetch page content from GraphQL for all pages, including home page
    // Pass language parameter to determine API type
    const page = await getPageBySlug(actualSlug, language);
    if (!page) {
        return (
            <div>
                <h1>Page not found</h1>
                <p>
                    Could not find page: {actualSlug} in language:{" "}
                    {language || "default"}
                </p>
            </div>
        );
    }

    // Select content and CSS based on language
    let displayBlocks = page.content;
    let displayCss = page.greenshiftInlineCss; // Always use main page CSS
    if (language === 'th' && page.translations && page.translations.length > 0) {
        displayBlocks = page.translations[0].content || page.content;
    }

    return (
        <div>
            {displayCss && (
                <style dangerouslySetInnerHTML={{ __html: displayCss }} />
            )}
            <BlockRenderer content={displayBlocks} />
            
            <ScriptLoader scripts={page.greenshiftScripts} />
        </div>
    );
}
