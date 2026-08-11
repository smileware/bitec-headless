import {
    GetGalleryByTaxonomyType as getGalleryPreview,
    GetGalleriesByTypes,
} from '../../../lib/block';
import {
    GetGalleryByTaxonomyType as getGalleryArchive,
    getGalleryTypeBySlug,
} from '../../../lib/gallery';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import {
    readContentEnum,
    readContentInteger,
} from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

const VALID_SLUG = /^[a-z0-9_-]+$/i;
const GALLERY_MODES = new Set(['preview', 'archive', 'term', 'types']);
const VALID_CURSOR = /^[A-Za-z0-9+/=_-]+$/;

function readSlug(value) {
    return value && value.length <= 100 && VALID_SLUG.test(value) ? value : null;
}

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const modeResult = readContentEnum(searchParams, 'mode', GALLERY_MODES, 'preview');
    const limitResult = readContentInteger(searchParams, 'limit', {
        fallback: 12,
        max: 24,
    });
    if (!modeResult.valid) return contentError('Invalid gallery mode', 400, startedAt);
    if (!limitResult.valid) return contentError('Invalid limit', 400, startedAt);

    const mode = modeResult.value;
    const limit = limitResult.value;

    try {
        let data;
        const originOptions = { throwOnError: true, signal: request.signal };

        if (mode === 'types') {
            const pageResult = readContentInteger(searchParams, 'page', {
                fallback: 1,
                max: 1000,
            });
            const perPageResult = readContentInteger(searchParams, 'perPage', {
                fallback: 12,
                max: 24,
            });
            if (!pageResult.valid) return contentError('Invalid page', 400, startedAt);
            if (!perPageResult.valid) return contentError('Invalid page size', 400, startedAt);

            const rawTypeSlugs = searchParams.get('typeSlugs');
            const candidates = rawTypeSlugs === null ? [] : rawTypeSlugs.split(',');
            if (
                candidates.length > 20
                || candidates.some((candidate) => !readSlug(candidate))
            ) {
                return contentError('Invalid gallery types', 400, startedAt);
            }
            const typeSlugs = candidates.map(readSlug);
            data = await GetGalleriesByTypes(
                typeSlugs.length > 0 ? typeSlugs : null,
                pageResult.value,
                perPageResult.value,
                originOptions
            );
        } else {
            const slug = readSlug(searchParams.get('slug'));
            if (!slug) {
                return contentError('Invalid gallery type', 400, startedAt);
            }

            if (mode === 'archive') {
                const rawAfter = searchParams.get('after');
                if (
                    rawAfter !== null
                    && (rawAfter.length < 1 || rawAfter.length > 500 || !VALID_CURSOR.test(rawAfter))
                ) {
                    return contentError('Invalid gallery cursor', 400, startedAt);
                }
                data = await getGalleryArchive(slug, limit, rawAfter, originOptions);
            } else if (mode === 'term') {
                data = await getGalleryTypeBySlug(slug, originOptions);
            } else {
                data = await getGalleryPreview(slug, limit, {
                    ...originOptions,
                });
            }
        }

        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(`[content-api] route=galleries outcome=error name=${error?.name || 'Error'}`);
        }
        return contentError('Unable to load gallery content', 502, startedAt);
    }
}
