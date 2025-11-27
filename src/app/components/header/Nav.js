'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Nav({ nav, isMobile = false, onCloseMenu }) {
  const path = usePathname();
  const [activeMobileItems, setActiveMobileItems] = useState(new Set());

  // Handle SVG arrow clicks in mobile menu
  const handleSvgClick = (e, itemId) => {
    if (!isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    
    setActiveMobileItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle submenu toggle clicks (if you have a separate toggle button)
  const handleSubmenuToggle = (e, itemId) => {
    if (!isMobile) return;
    e.preventDefault();
    e.stopPropagation();

    setActiveMobileItems(prev => {
      const newSet = new Set();
      if (!prev.has(itemId)) {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle menu link clicks
  const handleLinkClick = (e, item) => {
    if (!isMobile) return;
    
    const href = item.path || item.url || '#';
    
    if (href === '#') {
      e.preventDefault();
      setActiveMobileItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      // Close mobile menu when navigating to actual page
      setActiveMobileItems(new Set());
      onCloseMenu && onCloseMenu();
    }
  };

  return (
    <>
      {nav.map(item => {
        const hasChildren = item.children?.length > 0;
        const isActive = isMobile && activeMobileItems.has(item.id);
        
        return (
          <li 
            key={item.id} 
            className={`menu-item ${hasChildren ? 'menu-item-has-children' : ''} ${isActive ? 'active' : ''} ${item.cssClasses?.join(' ') || ''}`}
          >
            {item.cssClasses?.includes('underline-above') && (
              <div className="line-separator"></div>
            )}
            <Link
              href={item.path || item.url || '#'}
              className={`font-medium text-[#161616] flex items-center`}
              onClick={(e) => handleLinkClick(e, item)}
              prefetch={true}
            >

              {item.menuItemIcon?.menuIcon && (
                <span 
                  className="menu-icon" 
                  dangerouslySetInnerHTML={{ __html: item.menuItemIcon.menuIcon }}
                />
              )}
              
              {item.label}

              {hasChildren && (
                <svg
                  className={`w-4 h-4 ml-1 transition-transform text-[#636363] ${isActive ? 'scale-y-[-1]' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  onClick={(e) => handleSvgClick(e, item.id)}
                  style={{ cursor: isMobile ? 'pointer' : 'default' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </Link>

            {hasChildren && (
              <ul className="sub-menu">
                {item.children.map(child => (
                  <li key={child.id} className="menu-item">
                    <Link
                      href={child.path || child.url || '#'}
                      className={`block px-2 py-1 text-sm flex items-center ${path.startsWith(child.path || '') ? 'font-bold' : ''}`}
                      onClick={(e) => handleLinkClick(e, child)}
                      prefetch={true}
                    >
                      {child.menuItemIcon?.menuIcon && (
                        <span 
                          className="menu-icon" 
                          dangerouslySetInnerHTML={{ __html: child.menuItemIcon.menuIcon }}
                        />
                      )}
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}