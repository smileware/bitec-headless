import {
    getAllEventCategories,
    getAllEventYears,
    getFilteredEvents,
    getRecentBitecLiveEvents,
    getRecentEvents,
} from '../../../lib/eventContent';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import {
    readContentEnum,
    readContentInteger,
    readContentLanguage,
} from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

const EVENT_MODES = new Set(['filtered', 'recent', 'bitec-live', 'categories', 'years']);

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const modeResult = readContentEnum(searchParams, 'mode', EVENT_MODES, 'filtered');
    const languageResult = readContentLanguage(searchParams);
    const eventTypeResult = readContentEnum(
        searchParams,
        'eventType',
        new Set(['upcoming', 'past']),
        'upcoming'
    );
    const limitResult = readContentInteger(searchParams, 'limit', { fallback: 9, max: 24 });
    const categoryResult = readContentInteger(searchParams, 'categoryId', {
        fallback: null,
        max: 2147483647,
    });
    const monthResult = readContentInteger(searchParams, 'month', {
        fallback: null,
        max: 12,
    });
    const yearResult = readContentInteger(searchParams, 'year', {
        fallback: null,
        min: 2000,
        max: 2100,
    });
    const pageResult = readContentInteger(searchParams, 'page', {
        fallback: 1,
        max: 1000,
    });
    const perPageResult = readContentInteger(searchParams, 'perPage', {
        fallback: 12,
        max: 24,
    });

    if (!modeResult.valid) {
        return contentError('Invalid event mode', 400, startedAt);
    }
    if (!languageResult.valid) return contentError('Invalid language', 400, startedAt);
    if (!eventTypeResult.valid) return contentError('Invalid event type', 400, startedAt);
    if (!limitResult.valid) return contentError('Invalid limit', 400, startedAt);
    if (!categoryResult.valid) return contentError('Invalid category', 400, startedAt);
    if (!monthResult.valid) return contentError('Invalid month', 400, startedAt);
    if (!yearResult.valid) return contentError('Invalid year', 400, startedAt);
    if (!pageResult.valid) return contentError('Invalid page', 400, startedAt);
    if (!perPageResult.valid) return contentError('Invalid page size', 400, startedAt);

    const mode = modeResult.value;
    const language = languageResult.value;
    const limit = limitResult.value;

    const filters = {
        categoryId: categoryResult.value,
        eventType: eventTypeResult.value,
        month: monthResult.value,
        year: yearResult.value,
        page: pageResult.value,
        perPage: perPageResult.value,
    };

    try {
        let data;
        const originOptions = { language, signal: request.signal };
        if (mode === 'recent') {
            data = await getRecentEvents(limit, originOptions);
        } else if (mode === 'bitec-live') {
            const locationId = searchParams.get('locationId') || 'Bitec Live';
            if (locationId !== 'Bitec Live') {
                return contentError('Invalid event location', 400, startedAt);
            }
            data = await getRecentBitecLiveEvents(locationId, limit, originOptions);
        } else if (mode === 'categories') {
            data = await getAllEventCategories(originOptions);
        } else if (mode === 'years') {
            data = await getAllEventYears(originOptions);
        } else {
            data = await getFilteredEvents(filters, originOptions);
        }
        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(`[content-api] route=events outcome=error name=${error?.name || 'Error'}`);
        }
        return contentError('Unable to load event content', 502, startedAt);
    }
}
