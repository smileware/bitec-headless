import { getSiteInfo, getGlobalStyle } from "./lib/api";

import Header from './components/header/Header';
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
  const globalStyle = await getGlobalStyle();
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
          <link rel="stylesheet" href={globalStyle.sDesktopCssUrl} type="text/css" media="(min-width: 1023px)" />
        )}
      </head>
      <body>
        <div id="page" className="site">
          <Header />
          <div className="site-header-space"></div>
          {children}
        </div>
      </body>
    </html>
  );
}
