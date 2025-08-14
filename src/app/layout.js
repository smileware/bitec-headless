import { getSiteInfo, getGlobalStyle } from "./lib/api";
import { getFooterData } from "./lib/footer";

export const revalidate = 300; // Re-generate pages every 5 minutes
import { SpeedInsights } from "@vercel/speed-insights/next"

import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import FluentFormHandler from './components/FluentFormHandler';
import "./globals.css";
import "./css/scss/main.scss";

export async function generateMetadata() {
  const site = await getSiteInfo();
  return {
    title: site.title,
    description: site.description,
  };
}

export default async function RootLayout({ children }) {
  const [globalStyle, footerData] = await Promise.all([
    getGlobalStyle(),
    getFooterData()
  ]);

  return (
    <html lang="en">
      <head>
        {globalStyle.globalInlineCss && (
          <style dangerouslySetInnerHTML={{ __html: globalStyle.globalInlineCss }} />
        )}
        {globalStyle?.sMobileCssUrl && (
          <link rel="stylesheet" href={globalStyle.sMobileCssUrl} type="text/css"/>
        )}
        {globalStyle?.sDesktopCssUrl && (
          <link rel="stylesheet" href={globalStyle.sDesktopCssUrl} type="text/css" media="(min-width: 1024px)" />
        )}
      </head>
      <body className="gspbody gspb-bodyfront">
        <div id="page" className="site">
          <Header />
          <div className="site-header-space"></div>
          {children}
          <Footer 
            footerData={footerData}
            isServerSide={true}
          />
          {/* Global FluentForm handler for all pages */}
          <FluentFormHandler />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
