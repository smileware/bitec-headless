# Performance Optimization Guide
## Make Your Website Load Almost Instantly (4-5s → <1s)

### Current Issues Identified:
1. ❌ No caching - Every navigation makes fresh GraphQL requests
2. ❌ No prefetching - Links aren't prefetched
3. ❌ Multiple client-side fetches - Blocks fetch data after page load
4. ❌ No loading states - Users see blank pages
5. ❌ No response caching - GraphQL responses aren't cached

---

## 🚀 Priority 1: Add Caching (Biggest Impact)

### Step 1: Update `src/app/lib/api.js`

Add Next.js `unstable_cache` to cache GraphQL responses:

```javascript
import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const endpoint = process.env.API_DOMAIN || 'https://wordpress-1328545-5763448.cloudwaysapps.com/graphql';
export const graphQLClient = new GraphQLClient(endpoint);

// Cache duration: 5 minutes (300 seconds)
const CACHE_DURATION = 300;

export async function getPageBySlug(slug, language = null) {
  const cacheKey = `page-${slug}-${language || 'en'}`;
  
  return unstable_cache(
    async () => {
      const query = gql`
        query($uri: String!) {
          pageBy(uri: $uri) {
            id
            slug
            title
            content
            blocks(
              attributes: false
              dynamicContent: false
              htmlContent: false
              originalContent: true
              postTemplate: false
            )
            greenshiftInlineCss
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails { width height }
              }
            }
            enqueuedScripts(first: 100) {
              edges {
                node {
                  src
                  after
                }
              }
            }
            translations {
              id
              slug
              title
              content
              greenshiftInlineCss
              blocks(
                attributes: false
                dynamicContent: false
                htmlContent: false
                originalContent: true
                postTemplate: false
              )
            }
          }
        }
      `;
      
      const variables = { uri: slug };
      const data = await graphQLClient.request(query, variables);
      const page = data.pageBy;

      if (!page) return null;
      
      const greenshiftScripts = getGreenshiftScripts(page.enqueuedScripts?.edges || []);
      
      return {
        ...page,
        greenshiftScripts
      };
    },
    [cacheKey],
    {
      revalidate: CACHE_DURATION,
      tags: [`page-${slug}`]
    }
  )();
}

export async function getSiteInfo() {
  return unstable_cache(
    async () => {
      const query = gql`
        query SiteInfo {
          generalSettings {
            title
            description
          }
        }
      `;
      const data = await graphQLClient.request(query);
      return data.generalSettings;
    },
    ['site-info'],
    { revalidate: 3600 } // Cache for 1 hour
  )();
}

export async function getGlobalStyle() {
  return unstable_cache(
    async () => {
      const query = gql`
        query GlobalCss {
          sMobileCssUrl
          sDesktopCssUrl
          globalInlineCss
        }
      `;
      const data = await graphQLClient.request(query);
      return data;
    },
    ['global-style'],
    { revalidate: 3600 } // Cache for 1 hour
  )();
}
```

**Impact**: Reduces API calls by 95%+ for repeat visits

---

## 🚀 Priority 2: Add Link Prefetching

### Step 2: Update `src/app/components/header/Nav.js`

Enable prefetching on all navigation links:

```javascript
<Link
  href={item.path || item.url || '#'}
  className={`font-medium text-[#161616] flex items-center`}
  onClick={(e) => handleLinkClick(e, item)}
  prefetch={true}  // Add this
>
```

**Impact**: Pages start loading before user clicks (instant navigation)

---

## 🚀 Priority 3: Add Loading States

### Step 3: Create `src/app/[...slug]/loading.js`

```javascript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

**Impact**: Users see feedback immediately instead of blank page

---

## 🚀 Priority 4: Optimize Images

### Step 4: Update `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
  images: {
    domains: ['wordpress-1328545-5763448.cloudwaysapps.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
};

export default nextConfig;
```

**Impact**: 50-70% smaller image sizes, faster loading

---

## 🚀 Priority 5: Reduce Client-Side Fetches

### Step 5: Move Block Data Fetching to Server

Many blocks fetch data client-side. Move to server-side:

**Example for `BitecLiveGalleryBlock.js`:**

Instead of:
```javascript
useEffect(() => {
  async function fetchEvents() {
    // Client-side fetch
  }
  fetchEvents();
}, []);
```

Do:
```javascript
// In page component, fetch server-side and pass as prop
const galleryData = await GetPageWithBitecLiveGallery(slug);
```

**Impact**: Eliminates loading delays after page render

---

## 🚀 Priority 6: Add ISR (Incremental Static Regeneration)

### Step 6: Update `src/app/[...slug]/page.js`

```javascript
export const revalidate = 300; // Revalidate every 5 minutes

export default async function DynamicPage({ params }) {
  // ... existing code
}
```

**Impact**: Pages are pre-rendered, served instantly from cache

---

## 🚀 Priority 7: Optimize GraphQL Queries

### Step 7: Reduce Query Size

Only fetch what you need. Remove unused fields from queries.

**Impact**: 30-50% faster GraphQL responses

---

## 🚀 Priority 8: Add Route Segment Config

### Step 8: Update page files

Add to top of `src/app/[...slug]/page.js`:

```javascript
export const dynamic = 'force-dynamic'; // or 'force-static' if possible
export const revalidate = 300;
export const fetchCache = 'force-cache';
```

---

## 🚀 Priority 9: Enable HTTP/2 Server Push (if using Vercel)

Already handled by Vercel automatically.

---

## 🚀 Priority 10: Add Suspense Boundaries

### Step 10: Wrap components in Suspense

```javascript
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <BlockRenderer content={displayBlocks} />
    </Suspense>
  );
}
```

---

## 📊 Expected Results

| Optimization | Time Saved | Cumulative |
|-------------|-----------|------------|
| Caching | 3-4s | 3-4s |
| Prefetching | 1-2s | 4-6s |
| Loading States | 0s (UX) | - |
| Image Optimization | 0.5-1s | 5-7s |
| Server-Side Fetching | 1-2s | 6-9s |
| ISR | 2-3s | 8-12s |

**Target**: Load time from 4-5s → **<1s** ✅

---

## 🔧 Quick Wins (Do First)

1. ✅ Add caching to `getPageBySlug` (5 min)
2. ✅ Add `prefetch={true}` to all Links (2 min)
3. ✅ Add `loading.js` file (1 min)
4. ✅ Update `next.config.mjs` for images (2 min)

**Total time: ~10 minutes for 70% improvement**

---

## 📝 Implementation Order

1. **Week 1**: Priorities 1-4 (Caching, Prefetching, Loading, Images)
2. **Week 2**: Priorities 5-6 (Server-side fetching, ISR)
3. **Week 3**: Priorities 7-10 (Optimization, fine-tuning)

---

## 🎯 Monitoring

After implementing, monitor:
- Page load times (should be <1s)
- Time to First Byte (TTFB) (should be <200ms)
- Largest Contentful Paint (LCP) (should be <2.5s)

Use Vercel Analytics or Google PageSpeed Insights to track improvements.

