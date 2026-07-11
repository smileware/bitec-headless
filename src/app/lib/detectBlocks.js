/**
 * Detect registered BlockRenderer block IDs present in WordPress HTML.
 * Aligned with BLOCK_MAP in components/BlockRenderer.js
 */

export const BLOCK_DEFINITIONS = [
  { id: 'block-event-carousel' },
  { id: 'block-news-activity' },
  { id: 'block-whats-on' },
  { id: 'block-bitec-live-carousel' },
  { id: 'block-bitec-live-gallery' },
  { id: 'block-bitec-live-facilities' },
  { id: 'block-query-gallery-by-type' },
  { id: 'block-news-activity-sustainability' },
  { id: 'block-tab-accordion' },
  { id: 'block-event-hall-carousel', startsWith: true },
  { id: 'block-bitec-live-hall-carousel', startsWith: true },
  { id: 'block-photo-gallery' },
  { id: 'block-query-hotel-carousel' },
  { id: 'block-recommended-hotel-carousel' },
  { id: 'block-hotel-map' },
  { id: 'block-simple-gallery-carousel', startsWith: true },
  { id: 'block-display-gallery' },
  { id: 'block-retail-information', startsWith: true },
];

/**
 * @param {string} html - page content HTML
 * @returns {Set<string>} canonical block ids (e.g. "block-event-carousel")
 */
export function detectBlockIds(html) {
  const found = new Set();
  if (!html || typeof html !== 'string') {
    return found;
  }

  const re = /\bid=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const domId = match[1];
    for (const def of BLOCK_DEFINITIONS) {
      const hits = def.startsWith
        ? domId.startsWith(def.id)
        : domId === def.id;
      if (hits) {
        found.add(def.id);
      }
    }
  }

  return found;
}
