'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ nav }) {
  const path = usePathname();

  return (
    <ul id="top-menu" className="top-nav-menu menu flex mb-0 _desktop">
      {nav.map(item => (
        <li key={item.id} className={`menu-item ${item.children?.length > 0 ? 'menu-item-has-children' : ''}`}>
          <Link
            href={item.path || item.url || '#'}
            className={`font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white ${path.startsWith(item.path || '') ? 'font-bold text-gray-800 dark:text-white' : ''}`}
          >
            {item.label}
          </Link>

          {item.children?.length > 0 && (
            <ul className="sub-menu">
              {item.children.map(child => (
                <li key={child.id} className="menu-item">
                  <Link
                    href={child.path || child.url || '#'}
                    className={`block px-2 py-1 text-sm hover:text-blue-500 ${path.startsWith(child.path || '') ? 'font-bold' : ''}`}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}