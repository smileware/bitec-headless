import { NextResponse } from 'next/server';
import {
    getNewsActivityContent,
    getNewsActivitySustainability,
} from '../../../lib/news-activity';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=120, stale-while-revalidate=600';

function readInteger(searchParams, name, fallback, min, max) {
    const value = Number.parseInt(searchParams.get(name) || '', 10);
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = readInteger(searchParams, 'page', 1, 1, 1000);
    const perPage = readInteger(searchParams, 'perPage', 9, 1, 24);
    const language = searchParams.get('language') === 'th' ? 'th' : 'en';
    const filter = searchParams.get('filter') === 'blog' ? 'blog' : 'news';
    const type = searchParams.get('type') === 'sustainability'
        ? 'sustainability'
        : 'news';

    try {
        const data = type === 'sustainability'
            ? await getNewsActivitySustainability(page, perPage, language)
            : await getNewsActivityContent(page, perPage, language, filter);

        return NextResponse.json(data, {
            headers: { 'Cache-Control': CACHE_CONTROL },
        });
    } catch (error) {
        console.error('Dynamic news API error:', error);
        return NextResponse.json(
            { message: 'Unable to load news content' },
            { status: 502, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
