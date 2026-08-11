import {
    GetAllCategories,
    GetAllHotels,
    GetHotels,
    GetRecommendedHotels,
} from '../../../lib/block';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import {
    readContentEnum,
    readContentInteger,
    readContentLanguage,
} from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

const HOTEL_MODES = new Set(['list', 'recommended', 'all', 'categories']);

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const modeResult = readContentEnum(searchParams, 'mode', HOTEL_MODES, 'list');
    const limitResult = readContentInteger(searchParams, 'limit', {
        fallback: 8,
        max: 24,
    });
    const languageResult = readContentLanguage(searchParams);
    if (!modeResult.valid) {
        return contentError('Invalid hotel mode', 400, startedAt);
    }
    if (!limitResult.valid) return contentError('Invalid limit', 400, startedAt);
    if (!languageResult.valid) return contentError('Invalid language', 400, startedAt);

    const mode = modeResult.value;
    const limit = limitResult.value;
    const isTH = languageResult.value === 'th';

    try {
        const options = { throwOnError: true, signal: request.signal };
        let data;
        if (mode === 'recommended') {
            data = await GetRecommendedHotels(limit, isTH, options);
        } else if (mode === 'all') {
            data = await GetAllHotels(isTH, options);
        } else if (mode === 'categories') {
            data = await GetAllCategories(isTH, options);
        } else {
            data = await GetHotels(limit, options);
        }
        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(`[content-api] route=hotels outcome=error name=${error?.name || 'Error'}`);
        }
        return contentError('Unable to load hotel content', 502, startedAt);
    }
}
