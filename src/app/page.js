import { getPageBySlug } from './lib/api';
import ScriptLoader from './components/ScriptLoader';
import BlockRenderer from './components/BlockRenderer';

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