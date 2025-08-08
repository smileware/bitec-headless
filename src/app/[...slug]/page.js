import { getPageBySlug } from "../lib/api";
import ScriptLoader from '../components/ScriptLoader';
import BlockRenderer from '../components/BlockRenderer';

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
