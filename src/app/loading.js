import PageContentFallback from './components/layout/PageContentFallback';

// Route-level loading UI for the homepage. Shows instantly on navigation while
// the server component runs, so a click gives immediate feedback rather than the
// previous page appearing frozen. See src/app/[...slug]/loading.js for details.
export default function Loading() {
  return <PageContentFallback />;
}
