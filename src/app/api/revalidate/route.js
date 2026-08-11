import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

const CONTENT_TYPES = new Set([
    'page',
    'post',
    'event',
    'gallery',
    'hotel',
    'navigation',
    'footer',
]);
const VALID_SLUG = /^[\p{L}\p{N}/_-]+$/u;

function unauthorized() {
    return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
}

function invalid(message) {
    return NextResponse.json(
        { success: false, message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
}

function secretsMatch(expected, supplied) {
    if (!expected || !supplied) return false;
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    return expectedBuffer.length === suppliedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function normalizeSlug(value) {
    if (!value) return null;
    if (typeof value !== 'string' || value.length > 200 || value.includes('..')) return null;
    const slug = value.replace(/^\/+|\/+$/g, '');
    return slug && VALID_SLUG.test(slug) ? slug.toLowerCase() : null;
}

function normalizePaths(value) {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.length > 20) return null;

    const paths = [];
    for (const candidate of value) {
        if (
            typeof candidate !== 'string'
            || candidate.length < 1
            || candidate.length > 300
            || !candidate.startsWith('/')
            || candidate.includes('..')
            || /[\r\n]/.test(candidate)
        ) {
            return null;
        }
        paths.push(candidate.replace(/\/{2,}/g, '/'));
    }
    return [...new Set(paths)];
}

export async function POST(request) {
    const suppliedSecret = request.headers.get('x-revalidate-secret');
    if (
        !secretsMatch(process.env.REVALIDATE_SECRET, suppliedSecret)
    ) {
        return unauthorized();
    }

    const body = await request.json().catch(() => null);
    if (!body || !CONTENT_TYPES.has(body.contentType)) {
        return invalid('Invalid content type');
    }

    const slug = normalizeSlug(body.slug);
    if (body.slug && !slug) return invalid('Invalid slug');
    const paths = normalizePaths(body.paths);
    if (!paths) return invalid('Invalid paths');

    const tags = new Set([`wp:${body.contentType}`]);
    if (slug) tags.add(`wp:${body.contentType}:${slug}`);

    for (const tag of tags) {
        revalidateTag(tag, 'max');
    }
    for (const path of paths) {
        revalidatePath(path);
    }

    return NextResponse.json(
        {
            revalidated: true,
            contentType: body.contentType,
            tags: [...tags],
            paths,
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}

export function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        {
            status: 405,
            headers: {
                Allow: 'POST',
                'Cache-Control': 'no-store',
            },
        }
    );
}
