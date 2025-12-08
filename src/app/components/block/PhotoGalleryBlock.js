'use client';

import { usePhotoGallery } from '../../hooks/useBlockQueries';
import Skeleton from '../ui/Skeleton';
import GallerySwiper from '../GallerySwiper';

export default function PhotoGalleryBlock(props) {
    // Use React Query hook - automatically caches and deduplicates requests
    const { data: galleryData, isLoading: loading, error } = usePhotoGallery();

    if (loading) {
        return (
            <div {...props} className="photo-gallery-block">
                <div className="relative mb-[60px]">
                    {/* Swiper skeleton */}
                    <div className="flex gap-4 overflow-hidden justify-center">
                        <div className="flex-shrink-0 w-[20%]">
                            <Skeleton width="w-full" height="h-[400px]" rounded="rounded-md" />
                        </div>
                        <div className="flex-shrink-0 w-[60%]">
                            <Skeleton width="w-full" height="h-[400px]" rounded="rounded-md" />
                        </div>
                        <div className="flex-shrink-0 w-[20%]">
                            <Skeleton width="w-full" height="h-[400px]" rounded="rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div {...props} className="photo-gallery-block">
                <div className="text-center text-red-500">
                    Error loading photo gallery: {error.message}
                </div>
            </div>
        );
    }

    if (!galleryData || !galleryData.photoGalleries || galleryData.photoGalleries.length === 0) {
        return (
            <div {...props} className="photo-gallery-block">
                <div className="text-center text-gray-500">
                    No photo galleries found.
                </div>
            </div>
        );
    }

    return (
        <div {...props} className="photo-gallery-block">
            {galleryData.photoGalleries.map((gallery, index) => (
                <div key={index} className="mb-8">
                    {gallery.photoGallery && gallery.photoGallery.nodes && gallery.photoGallery.nodes.length > 0 && (
                        <GallerySwiper 
                            images={gallery.photoGallery.nodes}
                            title={gallery.title || 'Photo Gallery'}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

