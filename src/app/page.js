import { getPageBySlug } from './lib/api';
import ScriptLoader from './components/ScriptLoader';

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
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
            
            <ScriptLoader scripts={page.greenshiftScripts} />
        </main>
    );
}