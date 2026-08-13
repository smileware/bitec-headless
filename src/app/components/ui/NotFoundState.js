'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const COPY = {
    en: {
        eyebrow: '404 ERROR',
        title: 'Page not found',
        description: 'The page you are looking for may have moved, changed, or no longer exists.',
        button: 'BACK TO HOMEPAGE',
    },
    th: {
        eyebrow: 'ข้อผิดพลาด 404',
        title: 'ไม่พบหน้าที่คุณต้องการ',
        description: 'หน้าที่คุณกำลังค้นหาอาจถูกย้าย เปลี่ยนแปลง หรือไม่มีอยู่แล้ว',
        button: 'กลับสู่หน้าแรก',
    },
};

export default function NotFoundState({ language, title, description }) {
    const pathname = usePathname();
    const pathLanguage = pathname?.split('/').filter(Boolean)[0];
    const currentLanguage = language === 'th' || (!language && pathLanguage === 'th')
        ? 'th'
        : 'en';
    const copy = COPY[currentLanguage];
    const homeHref = currentLanguage === 'th' ? '/th' : '/';

    return (
        <section className={`${currentLanguage === 'en' ? 'font-brand ' : ''}bg-[#F4F4F4] min-h-[60vh] flex items-center py-[60px] lg:py-[100px] px-[20px]`}>
            <div className="w-full max-w-[1380px] mx-auto">
                <div className="max-w-[760px] mx-auto text-center flex flex-col items-center">
                    <span className="text-[var(--s-accent)] text-[18px] lg:text-[20px] font-medium tracking-[0.12em] uppercase mb-[18px]">
                        {copy.eyebrow}
                    </span>
                    <h1 className="text-[#161616] text-[42px] sm:text-[54px] lg:text-[68px] font-medium leading-[0.95] mb-[24px]">
                        {title || copy.title}
                    </h1>
                    <p className="max-w-[620px] text-[#454545] text-[22px] lg:text-[26px] leading-[1.25] mb-[36px]">
                        {description || copy.description}
                    </p>
                    <Link
                        href={homeHref}
                        className="inline-flex min-h-[52px] items-center justify-center bg-[var(--s-accent)] hover:bg-[var(--s-accent-hover)] text-white text-[18px] lg:text-[20px] font-medium px-[34px] py-[12px] transition-colors duration-200"
                    >
                        {copy.button}
                    </Link>
                </div>
            </div>
        </section>
    );
}
