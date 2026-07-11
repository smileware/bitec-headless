import Footer from '../footer/Footer';
import { getFooterData } from '../../lib/footer';

export default async function SiteFooter() {
  const footerData = await getFooterData();
  return <Footer footerData={footerData} isServerSide={true} />;
}
