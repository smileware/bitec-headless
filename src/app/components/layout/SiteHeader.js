import Header from '../header/Header';
import { getHeaderData } from '../../lib/header';

export default async function SiteHeader() {
  try {
    const [headerDataEn, headerDataTh] = await Promise.all([
      getHeaderData('en'),
      getHeaderData('th'),
    ]);

    return (
      <Header
        headerData={{ en: headerDataEn, th: headerDataTh }}
        isServerSide={true}
      />
    );
  } catch (error) {
    // WordPress GraphQL is unreachable/empty right now. Rather than caching an
    // empty server-rendered header (which hides the nav until ISR/unstable_cache
    // expires), fall back to the client-fetching Header so the browser retries
    // the menu after hydration and the nav still appears.
    console.error('SiteHeader: falling back to client-side header fetch:', error);
    return <Header isServerSide={false} />;
  }
}
