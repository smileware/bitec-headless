'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getWPMLLanguages } from '../lib/languages';
import { getSlugAndLanguageFromPathname } from '../lib/pageContext';
import { SkeletonButton } from './ui/Skeleton';

const FALLBACK_LANGUAGES = [
  {
    id: 'en',
    code: 'en',
    native_name: 'English',
    country_flag_url: '/img/us-flag.svg',
  },
  {
    id: 'th',
    code: 'th',
    native_name: 'ไทย',
    country_flag_url: '/img/th-flag.svg',
  },
];

function flagSrc(lang) {
  if (lang.code === 'th') return '/img/th-flag.svg';
  if (lang.code === 'en') return '/img/us-flag.svg';
  return lang.country_flag_url;
}

export default function LanguageSwitcher() {
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // Flag / label follow the URL immediately — do not wait on GraphQL.
  const currentLang = useMemo(
    () => getSlugAndLanguageFromPathname(pathname).language,
    [pathname]
  );

  // Fetch WPML list once (not on every pathname change).
  useEffect(() => {
    let cancelled = false;

    async function fetchLanguages() {
      try {
        const langs = await getWPMLLanguages();
        if (!cancelled && langs?.length) {
          setLanguages(langs);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLanguages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsSwitching(false);
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    const pathSegments = pathname.split('/').filter(Boolean);

    // Strip existing lang prefix if present
    if (pathSegments[0] === 'th' || pathSegments[0] === 'en') {
      pathSegments.shift();
    }

    let newUrl;
    if (langCode === 'en') {
      newUrl = '/' + pathSegments.join('/');
    } else {
      newUrl = '/' + langCode + '/' + pathSegments.join('/');
    }

    newUrl = newUrl.replace(/\/+/g, '/');
    if (newUrl !== '/' && newUrl.endsWith('/')) {
      newUrl = newUrl.slice(0, -1);
    }
    if (!newUrl) newUrl = '/';

    setIsOpen(false);
    setIsSwitching(true);
    router.push(newUrl);
  };

  // With fallbacks we can always show the control; only skeleton on first paint
  // before fallbacks are applied (effectively never after first render).
  if (loading && languages.length === 0) {
    return <SkeletonButton className="language-switcher" />;
  }

  if (languages.length <= 1) {
    return null;
  }

  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) ||
    FALLBACK_LANGUAGES.find((lang) => lang.code === currentLang);

  return (
    <div className="language-switcher relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 focus:outline-none transition-colors text-[#002F87]"
        aria-label="Change language"
      >
        {currentLanguage && (
          <>
            <img
              src={flagSrc(currentLanguage)}
              alt={currentLanguage.native_name}
              className="object-cover rounded-full"
            />
            <span className="font-medium text-[18px] uppercase lg:block hidden">
              {isSwitching ? 'Loading…' : currentLanguage.native_name.toUpperCase()}
            </span>
            {isSwitching && (
              <svg className="animate-spin h-4 w-4 text-[#002F87]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
          </>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'scale-y-[-1]' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 lg:w-[120px] w-12 bg-white shadow-lg z-50">
          {languages
            .filter((lang) => lang.code !== currentLang)
            .map((lang) => (
              <button
                key={lang.id || lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="cursor-pointer w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-[var(--s-accent-hover)] hover:text-white text-[#002F87]"
              >
                <img
                  src={flagSrc(lang)}
                  alt={lang.native_name}
                  className="object-cover rounded-full"
                />
                <span className="font-medium text-[18px] uppercase lg:block hidden">
                  {lang.native_name.toUpperCase()}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
