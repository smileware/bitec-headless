const scriptCache = new Map();

export async function GET(request) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url || !url.includes('greenshift-animation-and-page-builder-blocks')) {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        let text = scriptCache.get(url);
        if (!text) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            text = await response.text();
            scriptCache.set(url, text);
        }

        const wrapped = `(function(){\n${text}\n})();`;

        return new Response(wrapped, {
            headers: {
                'Content-Type': 'application/javascript; charset=utf-8',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            },
        });
    } catch (error) {
        return new Response(
            `console.warn("[gs-proxy] Failed to load:", ${JSON.stringify(url)});`,
            {
                status: 200,
                headers: { 'Content-Type': 'application/javascript' },
            }
        );
    }
}
