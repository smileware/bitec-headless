import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { GRAPHQL_CACHE_TAG } from '../../lib/api';

const DEFAULT_TAG = GRAPHQL_CACHE_TAG;

async function handleRequest(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    const tag = body.tag || searchParams.get('tag');
    const path = body.path || searchParams.get('path');
    const actions = {};

    if (tag) {
        await revalidateTag(tag);
        actions.tag = tag;
    }

    if (path) {
        await revalidatePath(path);
        actions.path = path;
    }

    if (!tag && !path) {
        await revalidateTag(DEFAULT_TAG);
        actions.tag = DEFAULT_TAG;
    }

    return NextResponse.json({ revalidated: true, ...actions });
}

export async function GET(request) {
    return handleRequest(request);
}

export async function POST(request) {
    return handleRequest(request);
}
