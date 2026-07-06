'use client';

import { useMemo, useId, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRetailInformation } from '../../hooks/useBlockQueries';

const pageBlockMappings = new Map();

function getRootProps(props, blockClass) {
    const { class: htmlClass, className, id, ...rest } = props;
    const mergedClassName = [htmlClass, className, blockClass].filter(Boolean).join(' ');

    return {
        id,
        className: mergedClassName,
        'data-block-identifier-id': rest['data-block-identifier-id'],
    };
}

function getPopoverId(instanceId, index) {
    return `retail-popup-${instanceId}-${index}`;
}

function showPopover(popoverId) {
    const el = document.getElementById(popoverId);
    if (el && typeof el.showPopover === 'function') {
        el.showPopover();
    }
}

function hidePopover(popoverId) {
    const el = document.getElementById(popoverId);
    if (el && typeof el.hidePopover === 'function') {
        el.hidePopover();
    }
}

function RetailPopoverContent({ item, popoverId }) {
    return (
        <div
            id={popoverId}
            popover="auto"
            className="retail-information-popover"
        >
            <div className="retail-information-popover-inner">
                <div className="retail-information-popover-media">
                    {item.contentImage ? (
                        <Image
                            src={item.contentImage}
                            alt={item.contentImageAlt || item.contentTitle || item.triggerText}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="retail-information-popover-media-placeholder" />
                    )}
                </div>

                <div className="retail-information-popover-body">
                    <button
                        type="button"
                        onClick={() => hidePopover(popoverId)}
                        className="retail-information-popover-close"
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>

                    {item.contentTitle && (
                        <h3 className="retail-information-popover-title">{item.contentTitle}</h3>
                    )}

                    {item.content && (
                        <div
                            className="retail-information-popover-content"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    )}

                    {(item.location || item.businessHour || item.capacity) && (
                        <div className="retail-information-popover-meta">
                            {item.location && (
                                <div className="retail-information-popover-meta-item">
                                    <svg className="retail-information-popover-meta-icon" width="18" height="18" viewBox="0 0 768 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path fill="#565D66" d="M384 192c-105.87 0-192 86.13-192 192s86.13 192 192 192 192-86.13 192-192-86.13-192-192-192zM384 512c-70.58 0-128-57.42-128-128s57.42-128 128-128 128 57.42 128 128-57.42 128-128 128zM384 0c-212.078 0-384 171.922-384 384 0 154.826 53.94 198.062 344.536 619.34 19.068 27.544 59.858 27.548 78.93 0 290.594-421.278 344.534-464.514 344.534-619.34 0-212.078-171.922-384-384-384zM384 947.862c-278.59-402.886-320-434.874-320-563.862 0-85.476 33.286-165.834 93.726-226.274s140.798-93.726 226.274-93.726 165.834 33.286 226.274 93.726 93.726 140.798 93.726 226.274c0 128.98-41.384 160.94-320 563.862z"/>
                                    </svg>
                                    <span>{item.location}</span>
                                </div>
                            )}
                            {item.businessHour && (
                                <div className="retail-information-popover-meta-item">
                                    <svg className="retail-information-popover-meta-icon" width="18" height="18" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path fill="#565D66" d="M981.333 512c0-129.579-52.565-246.997-137.472-331.861s-202.283-137.472-331.861-137.472-246.997 52.565-331.861 137.472-137.472 202.283-137.472 331.861 52.565 246.997 137.472 331.861 202.283 137.472 331.861 137.472 246.997-52.565 331.861-137.472 137.472-202.283 137.472-331.861zM896 512c0 106.069-42.923 201.984-112.469 271.531s-165.461 112.469-271.531 112.469-201.984-42.923-271.531-112.469-112.469-165.461-112.469-271.531 42.923-201.984 112.469-271.531 165.461-112.469 271.531-112.469 201.984 42.923 271.531 112.469 112.469 165.461 112.469 271.531zM469.333 256v256c0 16.597 9.472 31.019 23.595 38.144l170.667 85.333c21.077 10.539 46.72 2.005 57.259-19.072s2.005-46.72-19.072-57.259l-147.115-73.515v-229.632c0-23.552-19.115-42.667-42.667-42.667s-42.667 19.115-42.667 42.667z"/>
                                    </svg>
                                    <span>{item.businessHour}</span>
                                </div>
                            )}
                            {item.capacity && (
                                <div className="retail-information-popover-meta-item">
                                    <svg className="retail-information-popover-meta-icon" width="18" height="18" viewBox="0 0 1280 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path fill="#565D66" d="M960 512c106 0 192-86 192-192s-86-192-192-192-192 86-192 192 86 192 192 192zM960 224c53 0 96 43 96 96s-43 96-96 96-96-43-96-96 43-96 96-96zM544.2 552c-23.8 0-47.8 3.4-71 10.6-28.4 8.6-58.2 13.4-89.4 13.4s-61-4.8-89.4-13.4c-23.2-7-47.2-10.6-71-10.6-72.6 0-143.2 32.4-184.6 93.8-24.4 36.8-38.8 81-38.8 128.6v89.6c0 53 43 96 96 96h576c53 0 96-43 96-96v-89.6c0-47.6-14.4-91.8-39.2-128.6-41.4-61.4-112-93.8-184.6-93.8zM672 864h-576v-89.6c0-57.8 36.8-107.2 88.2-126.2 20.6-7.6 43.2-7.4 63.8 0 44.2 15.8 90 23.8 136 23.8s91.6-8 136.2-23.8c20.6-7.4 43.2-7.6 63.8 0 51.4 18.8 88.2 68.4 88.2 126.2v89.6zM384 512c123.8 0 224-100.2 224-224s-100.2-224-224-224-224 100.2-224 224 100.2 224 224 224zM384 160c70.6 0 128 57.4 128 128s-57.4 128-128 128-128-57.4-128-128 57.4-128 128-128zM1247.4 634.2c-34.6-51.2-93.4-78.2-153.8-78.2-55.6 0-69.6 20-133.6 20s-78-20-133.6-20c-26.6 0-52.4 6-76.4 16.2 11.6 11.8 22.6 24 32 37.8 9.4 14 17.2 28.8 24 44 6.6-1.4 13.4-2.2 20.4-2.2 34.4 0 59.2 20 133.6 20 74.8 0 99-20 133.6-20 31.4 0 59 13.4 74.2 35.8 10.6 15.8 16.2 34.2 16.2 53.4v59h-352v64c0 11-1.2 21.6-3.2 32h371.2c44.2 0 80-35.8 80-80v-74.6c0-39.8-12-76.6-32.6-107.2z"/>
                                    </svg>
                                    <span>{item.capacity}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RetailInformationBlock(props) {
    const pathname = usePathname();
    const reactInstanceId = useId().replace(/:/g, '');
    const blockInstanceId = `${props.id || 'block'}-${reactInstanceId}`;
    const [mounted, setMounted] = useState(false);
    const { data: allBlocks = [], isLoading, error } = useRetailInformation();
    const rootProps = getRootProps(props, 'retail-information-block');

    useEffect(() => {
        setMounted(true);
    }, []);

    const blockData = useMemo(() => {
        if (!allBlocks.length) return null;

        const identifier = props['data-block-identifier-id'] ||
                           props.dataBlockIdentifierId ||
                           props.blockIdentifierId ||
                           null;

        if (identifier) {
            const match = allBlocks.find(b => b.blockIdentifierId === identifier);
            if (match) return match;
        }

        if (allBlocks.length === 1) return allBlocks[0];

        if (props.id) {
            const pageKey = pathname;

            if (!pageBlockMappings.has(pageKey)) {
                pageBlockMappings.set(pageKey, {
                    idToIndex: new Map(),
                    counter: 0,
                });
            }

            const pageMapping = pageBlockMappings.get(pageKey);

            if (pageMapping.idToIndex.has(props.id)) {
                const index = pageMapping.idToIndex.get(props.id);
                return allBlocks[index] ?? allBlocks[0];
            }

            const index = pageMapping.counter % allBlocks.length;
            pageMapping.idToIndex.set(props.id, index);
            pageMapping.counter += 1;
            return allBlocks[index] ?? allBlocks[0];
        }

        return allBlocks[0];
    }, [allBlocks, props.id, pathname, props]);

    if (isLoading) {
        return (
            <div {...rootProps}>
                <div className="retail-information-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className={`retail-information-trigger-wrap is-skeleton${i > 4 ? ' is-skeleton-mobile-only' : ''}`}
                        >
                            <div className="retail-information-trigger-image skeleton" />
                            <div className="skeleton" style={{ height: 24, width: '70%', marginTop: 10 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !blockData || !blockData.items?.length) {
        return null;
    }

    const popovers = blockData.items.map((item, index) => {
        const popoverId = getPopoverId(blockInstanceId, index);
        return (
            <RetailPopoverContent
                key={popoverId}
                item={item}
                popoverId={popoverId}
            />
        );
    });

    return (
        <>
            <div {...rootProps}>
                <div className="retail-information-grid">
                    {blockData.items.map((item, index) => {
                        const popoverId = getPopoverId(blockInstanceId, index);
                        return (
                            <div key={popoverId} className="retail-information-trigger-wrap">
                                <button
                                    type="button"
                                    onClick={() => showPopover(popoverId)}
                                    className="retail-information-trigger"
                                >
                                    {item.triggerImage ? (
                                        <div className="retail-information-trigger-image">
                                            <Image
                                                src={item.triggerImage}
                                                alt={item.triggerImageAlt || item.triggerText}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="retail-information-trigger-image retail-information-trigger-placeholder" />
                                    )}
                                    {item.triggerText && (
                                        <h3 className="retail-information-trigger-title">
                                            {item.triggerText}
                                        </h3>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {mounted && createPortal(popovers, document.body)}
        </>
    );
}
