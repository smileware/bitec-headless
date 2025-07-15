'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getWPMLLanguages } from '../lib/languages';
import { SkeletonButton } from './ui/Skeleton';

export default function LanguageSwitcher() {

  const [languages, setLanguages] = useState([]);
  const [currentLang, setCurrentLang] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchLanguages() {
      try {

        const langs = await getWPMLLanguages();
        setLanguages(langs);
        
        const pathSegments = pathname.split('/').filter(Boolean);
        
        if (pathSegments.length === 0) {

          setCurrentLang('en');
        } else {
          const firstSegment = pathSegments[0];
          const langExists = langs.find(lang => lang.code === firstSegment);
          
          if (langExists) {
            setCurrentLang(firstSegment);
          } else {
            setCurrentLang('en');
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
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

  // Function to handle language change when user selects a new language
  const handleLanguageChange = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    const pathSegments = pathname.split('/').filter(Boolean);
    
    const currentLangObj = languages.find(lang => lang.code === currentLang);
    if (currentLangObj && currentLangObj.code !== 'en') {
      if (pathSegments[0] === currentLangObj.code) {
        pathSegments.shift();
      }
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
    
    setIsOpen(false);
    window.location.href = newUrl;

  };

  if (loading) {
    return <SkeletonButton className="language-switcher" />;
  }

  if (languages.length <= 1) {
    return null;
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang);
  return (
    <div className="language-switcher relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 focus:outline-none transition-colors text-[#002F87]"
      >
        {currentLanguage && (
          <>
            <img
              src={
                currentLanguage.code === 'th' 
                  ? '/img/th-flag.svg' 
                  : currentLanguage.code === 'en'
                  ? '/img/us-flag.svg'
                  : currentLanguage.country_flag_url
              }
              alt={currentLanguage.native_name}
              className="object-cover rounded-full"
            />
            <span className="font-medium text-[18px] uppercase lg:block hidden">
              {currentLanguage.native_name.toUpperCase()}
            </span>
          </>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'scale-y-[-1]' : ''
          }`}
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
          {languages.filter(lang => lang.code !== currentLang).map((lang) => (
            <button
              key={lang.id} 
              onClick={() => handleLanguageChange(lang.code)}
              className="cursor-pointer w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-[var(--s-accent-hover)] hover:text-white text-[#002F87]"
            >
              <img
                src={
                  lang.code === 'th' 
                    ? '/img/th-flag.svg' 
                    : lang.code === 'en'
                    ? '/img/us-flag.svg'
                    : lang.country_flag_url
                }
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