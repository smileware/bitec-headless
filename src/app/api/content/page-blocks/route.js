import {
    GetPageWithBitecLiveFacilities,
    GetPageWithBitecLiveGallery,
    GetPageWithBitecLiveHallCarousel,
    GetPageWithDisplayGalleryByType,
    GetPageWithEventHallCarousel,
    GetPageWithPhotoGallery,
    GetPageWithQueryGalleryByType,
    GetPageWithRetailInformation,
    GetPageWithSimpleGalleryCarousel,
    GetPageWithTabToAccordion,
} from '../../../lib/block';
import { contentError, contentJson } from '../../../lib/contentApiResponse';
import { readContentLanguage } from '../../../lib/contentApiValidation';

export const runtime = 'nodejs';

const VALID_SLUG = /^[\p{L}\p{N}/_-]+$/u;

const OPERATIONS = {
    'event-hall-carousel': ({ slug, isTH, options }) => GetPageWithEventHallCarousel(slug, isTH, options),
    'bitec-live-hall-carousel': ({ slug, isTH, options }) => GetPageWithBitecLiveHallCarousel(slug, isTH, options),
    'query-gallery-by-type': ({ slug, isTH, options }) => GetPageWithQueryGalleryByType(slug, isTH, options),
    'photo-gallery': ({ slug, isTH, options }) => GetPageWithPhotoGallery(slug, isTH, options),
    'bitec-live-facilities': ({ slug, isTH, options }) => GetPageWithBitecLiveFacilities(slug, isTH, options),
    'bitec-live-gallery': ({ slug, isTH, options }) => GetPageWithBitecLiveGallery(slug, isTH, options),
    'simple-gallery-carousel': ({ slug, options }) => GetPageWithSimpleGalleryCarousel(slug, options),
    'tab-accordion': ({ slug, options }) => GetPageWithTabToAccordion(slug, options),
    'display-gallery-by-type': ({ slug, isTH, options }) => GetPageWithDisplayGalleryByType(slug, isTH, options),
    'retail-information': ({ slug, isTH, options }) => GetPageWithRetailInformation(slug, isTH, options),
};

function readSlug(value) {
    if (!value || value.length > 200 || value.includes('..') || !VALID_SLUG.test(value)) {
        return null;
    }
    return value.replace(/^\/+|\/+$/g, '');
}

export async function GET(request) {
    const startedAt = performance.now();
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const execute = OPERATIONS[operation];
    if (!execute) {
        return contentError('Invalid page block operation', 400, startedAt);
    }

    const slug = readSlug(searchParams.get('slug'));
    if (!slug) {
        return contentError('Invalid page slug', 400, startedAt);
    }
    const languageResult = readContentLanguage(searchParams);
    if (!languageResult.valid) {
        return contentError('Invalid language', 400, startedAt);
    }

    try {
        const data = await execute({
            slug,
            isTH: languageResult.value === 'th',
            options: { throwOnError: true, signal: request.signal },
        });
        return contentJson(data, startedAt);
    } catch (error) {
        if (error?.name !== 'AbortError') {
            console.error(
                `[content-api] route=page-blocks operation=${operation} outcome=error name=${error?.name || 'Error'}`
            );
        }
        return contentError('Unable to load page block content', 502, startedAt);
    }
}
