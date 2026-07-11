import Header from '../header/Header';
import { getHeaderData } from '../../lib/header';

export default async function SiteHeader() {
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
}
