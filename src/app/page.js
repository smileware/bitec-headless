import { getPageBySlug } from './lib/api';
import Script from 'next/script';

export default async function Home() {
  const page = await getPageBySlug("/");
  
  if (!page) {
    return <div>Home page not found</div>;
  }

  return (
    <main className="">
       {page.greenshiftInlineCss && (
        <style dangerouslySetInnerHTML={{ __html: page.greenshiftInlineCss }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
      
      {/* Load greenshift scripts */}
      {page.greenshiftScripts?.map((src, index) => (
        <Script key={index} src={src} strategy="afterInteractive" />
      ))}
    </main>
  );
}