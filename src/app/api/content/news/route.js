import {
    getNewsActivityContent,
    getNewsActivitySustainability,
} from '../../../lib/news-activity';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import {
    readContentEnum,
    readContentInteger,
    readContentLanguage,
} from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const pageResult = readContentInteger(searchParams, 'page', { fallback: 1, max: 1000 });
    const perPageResult = readContentInteger(searchParams, 'perPage', { fallback: 9, max: 24 });
    const languageResult = readContentLanguage(searchParams);
    const filterResult = readContentEnum(
        searchParams,
        'filter',
        new Set(['news', 'blog']),
        'news'
    );
    const typeResult = readContentEnum(
        searchParams,
        'type',
        new Set(['news', 'sustainability']),
        'news'
    );
    if (!pageResult.valid) return contentError('Invalid page', 400, startedAt);
    if (!perPageResult.valid) return contentError('Invalid page size', 400, startedAt);
    if (!languageResult.valid) return contentError('Invalid language', 400, startedAt);
    if (!filterResult.valid) return contentError('Invalid news filter', 400, startedAt);
    if (!typeResult.valid) return contentError('Invalid news type', 400, startedAt);

    const page = pageResult.value;
    const perPage = perPageResult.value;
    const language = languageResult.value;
    const filter = filterResult.value;
    const type = typeResult.value;

    try {
        const data = type === 'sustainability'
            ? await getNewsActivitySustainability(
                page,
                perPage,
                language,
                { signal: request.signal }
            )
            : await getNewsActivityContent(
                page,
                perPage,
                language,
                filter,
                { signal: request.signal }
            );

        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(`[content-api] route=news outcome=error name=${error?.name || 'Error'}`);
        }
        return contentError('Unable to load news content', 502, startedAt);
    }
}
