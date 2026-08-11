import { getFooterData } from '../../../lib/footer';
import { getHeaderData } from '../../../lib/header';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import { readContentLanguage } from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (type !== 'header' && type !== 'footer') {
        return contentError('Invalid chrome content type', 400, startedAt);
    }
    const languageResult = readContentLanguage(searchParams);
    if (!languageResult.valid) {
        return contentError('Invalid language', 400, startedAt);
    }

    try {
        const data = type === 'header'
            ? await getHeaderData(languageResult.value, { signal: request.signal })
            : await getFooterData({ throwOnError: true, signal: request.signal });
        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(
                `[content-api] route=chrome type=${type} outcome=error name=${error?.name || 'Error'}`
            );
        }
        return contentError(`Unable to load ${type} content`, 502, startedAt);
    }
}
