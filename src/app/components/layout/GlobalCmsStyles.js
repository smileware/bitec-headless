import { getGlobalStyle } from '../../lib/api';

/**
 * CMS global CSS — loaded in Suspense so it does not block first HTML byte.
 */
export default async function GlobalCmsStyles() {
  const globalStyle = await getGlobalStyle();

  return (
    <>
      {globalStyle?.globalInlineCss ? (
        <style dangerouslySetInnerHTML={{ __html: globalStyle.globalInlineCss }} />
      ) : null}
      {globalStyle?.sMobileCssUrl ? (
        <link
          rel="stylesheet"
          href={globalStyle.sMobileCssUrl}
          type="text/css"
        />
      ) : null}
      {globalStyle?.sDesktopCssUrl ? (
        <link
          rel="stylesheet"
          href={globalStyle.sDesktopCssUrl}
          type="text/css"
          media="(min-width: 1024px)"
        />
      ) : null}
    </>
  );
}
