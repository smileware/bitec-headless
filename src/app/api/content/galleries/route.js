import { NextResponse } from 'next/server';
import {
    GetGalleryByTaxonomyType as getGalleryPreview,
    GetGalleriesByTypes,
} from '../../../lib/block';
import {
    GetGalleryByTaxonomyType as getGalleryArchive,
    getGalleryTypeBySlug,
} from '../../../lib/gallery';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=120, stale-while-revalidate=600';
const VALID_SLUG = /^[a-z0-9_-]+$/i;

function readInteger(searchParams, name, fallback, min, max) {
    const value = Number.parseInt(searchParams.get(name) || '', 10);
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

function readSlug(value) {
    return value && value.length <= 100 && VALID_SLUG.test(value) ? value : null;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const limit = readInteger(searchParams, 'limit', 12, 1, 1000);

    try {
        let data;

        if (mode === 'types') {
            const typeSlugs = (searchParams.get('typeSlugs') || '')
                .split(',')
                .map(readSlug)
                .filter(Boolean)
                .slice(0, 20);
            data = await GetGalleriesByTypes(typeSlugs.length > 0 ? typeSlugs : null, limit);
        } else {
            const slug = readSlug(searchParams.get('slug'));
            if (!slug) {
                return NextResponse.json(
                    { message: 'Invalid gallery type' },
                    { status: 400, headers: { 'Cache-Control': 'no-store' } }
                );
            }

            if (mode === 'archive') {
                const rawAfter = searchParams.get('after');
                const after = rawAfter && rawAfter.length <= 500 ? rawAfter : null;
                data = await getGalleryArchive(slug, Math.min(limit, 24), after);
            } else if (mode === 'term') {
                data = await getGalleryTypeBySlug(slug);
            } else {
                data = await getGalleryPreview(slug, Math.min(limit, 24));
            }
        }

        return NextResponse.json(data, {
            headers: { 'Cache-Control': CACHE_CONTROL },
        });
    } catch (error) {
        console.error('Dynamic galleries API error:', error);
        return NextResponse.json(
            { message: 'Unable to load gallery content' },
            { status: 502, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
