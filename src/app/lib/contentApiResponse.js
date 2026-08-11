import { NextResponse } from 'next/server';

export const CONTENT_API_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

function timingHeader(startedAt) {
    return `app;dur=${Math.max(0, performance.now() - startedAt).toFixed(1)}`;
}

export function contentJson(data, startedAt, { status = 200, headers = {} } = {}) {
    return NextResponse.json(data, {
        status,
        headers: {
            'Cache-Control': status >= 400 ? 'no-store' : CONTENT_API_CACHE_CONTROL,
            'Server-Timing': timingHeader(startedAt),
            ...headers,
        },
    });
}

export function contentError(message, status, startedAt) {
    return contentJson({ message }, startedAt, { status });
}
