import PageContentFallback from '../components/layout/PageContentFallback';

// Route-level loading UI. On navigation to a [...slug] page, Next shows this
// instantly while the server component (which awaits the WordPress fetch + block
// prefetch budget) runs — so a click gives immediate feedback instead of the old
// page appearing frozen. Unlike wrapping page content in <Suspense> ourselves,
// loading.js drives the client transition and does not strand SSR content in a
// hidden streaming placeholder.
export default function Loading() {
  return <PageContentFallback />;
}
