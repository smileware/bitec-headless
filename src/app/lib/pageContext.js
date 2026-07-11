/**
 * Slug / language helpers shared by server prefetch and client hooks.
 * Must stay byte-compatible with historical useSlugAndLanguage behavior.
 */

/**
 * Parse a URL pathname the same way client hooks do.
 * @param {string} pathname e.g. "/", "/about", "/th", "/th/about"
 * @returns {{ slug: string, isTH: boolean, language: 'en' | 'th' }}
 */
export function getSlugAndLanguageFromPathname(pathname) {
  const path = (pathname || '').replace(/^\/|\/$/g, '');
  const parts = path.split('/').filter(Boolean);
  const hasLangPrefix = parts[0] === 'th';
  const isTH = hasLangPrefix;
  const slug = hasLangPrefix
    ? parts.slice(1).join('/') || 'home'
    : path || 'home';
  return {
    slug,
    isTH,
    language: isTH ? 'th' : 'en',
  };
}

/**
 * Resolve context from App Router [...slug] / home page params.
 * @param {{ actualSlug?: string | null, language?: string | null }} params
 *   actualSlug: "/" or "about" (as used by getPageBySlug)
 *   language: "th" | "en" | null (null = English, no prefix)
 */
export function resolvePageContext({ actualSlug, language } = {}) {
  const isTH = language === 'th';
  let slug = actualSlug;
  if (!slug || slug === '/') {
    slug = 'home';
  }
  return {
    slug,
    isTH,
    language: isTH ? 'th' : 'en',
  };
}
