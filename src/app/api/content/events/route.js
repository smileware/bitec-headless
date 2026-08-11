import { NextResponse } from 'next/server';
import { getFilteredEvents } from '../../../lib/event';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=120, stale-while-revalidate=600';

function readOptionalInteger(searchParams, name, min, max) {
    const rawValue = searchParams.get(name);
    if (!rawValue) return null;

    const value = Number.parseInt(rawValue, 10);
    return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function readInteger(searchParams, name, fallback, min, max) {
    return readOptionalInteger(searchParams, name, min, max) ?? fallback;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rawCategoryId = searchParams.get('categoryId');
    const categoryId = rawCategoryId && rawCategoryId.length <= 200
        ? rawCategoryId
        : null;
    const eventType = searchParams.get('eventType') === 'past' ? 'past' : 'upcoming';

    const filters = {
        categoryId,
        eventType,
        month: readOptionalInteger(searchParams, 'month', 1, 12),
        year: readOptionalInteger(searchParams, 'year', 2000, 2100),
        page: readInteger(searchParams, 'page', 1, 1, 1000),
        perPage: readInteger(searchParams, 'perPage', 12, 1, 24),
    };

    try {
        const data = await getFilteredEvents(filters);
        return NextResponse.json(data, {
            headers: { 'Cache-Control': CACHE_CONTROL },
        });
    } catch (error) {
        console.error('Dynamic events API error:', error);
        return NextResponse.json(
            { message: 'Unable to load event content' },
            { status: 502, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
