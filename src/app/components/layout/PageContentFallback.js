/**
 * Visible placeholder while getPageBySlug is in flight.
 * Keeps the document from feeling like a blank white page.
 */
export default function PageContentFallback() {
  return (
    <main
      className="max-w-[1340px] mx-auto px-5 py-10 min-h-[50vh]"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-[220px] md:h-[360px] w-full bg-[#e8e8ea] rounded-sm" />
        <div className="h-8 w-2/3 max-w-md bg-[#e8e8ea] rounded-sm" />
        <div className="h-4 w-full max-w-2xl bg-[#e8e8ea] rounded-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[0, 1, 2].map((key) => (
            <div key={key} className="space-y-3">
              <div className="h-40 w-full bg-[#e8e8ea] rounded-sm" />
              <div className="h-4 w-3/4 bg-[#e8e8ea] rounded-sm" />
              <div className="h-4 w-1/2 bg-[#e8e8ea] rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
