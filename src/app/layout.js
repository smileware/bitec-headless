import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getSiteInfo } from './lib/api';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import FluentFormHandler from './components/FluentFormHandler';
import NavigationProgress from './components/NavigationProgress';
import { QueryProvider } from './components/QueryProvider';
import SiteHeader from './components/layout/SiteHeader';
import SiteFooter from './components/layout/SiteFooter';
import GlobalCmsStyles from './components/layout/GlobalCmsStyles';
import './globals.css';
import './css/scss/main.scss';

export const revalidate = 300;

export async function generateMetadata() {
  try {
    const site = await getSiteInfo();
    return {
      title: site?.title || 'BITEC',
      description: site?.description || '',
    };
  } catch {
    return {
      title: 'BITEC',
      description: '',
    };
  }
}

/**
 * Sync shell — does not await GraphQL. Header/footer/CMS CSS stream in via Suspense
 * so the browser can paint immediately instead of a blank document for seconds.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="gspbody gspb-bodyfront">
        <QueryProvider>
          <NavigationProgress />
          <Suspense fallback={null}>
            <GlobalCmsStyles />
          </Suspense>
          <div id="page" className="site">
            <Suspense fallback={<Header isServerSide={false} />}>
              <SiteHeader />
            </Suspense>
            <div className="site-header-space" />
            {children}
            <Suspense fallback={<Footer isServerSide={false} />}>
              <SiteFooter />
            </Suspense>
            <FluentFormHandler />
          </div>
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
