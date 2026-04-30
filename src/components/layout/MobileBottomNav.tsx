'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: 'fas fa-home',
      activeColor: 'text-red-600'
    },
    {
      label: 'Shop',
      href: '/marketplace',
      icon: 'fas fa-shopping-bag',
      activeColor: 'text-green-500'
    },
    {
      label: 'Book',
      href: '/book-appointment',
      icon: 'fas fa-calendar-plus',
      activeColor: 'text-blue-600'
    },
    {
      label: 'Track',
      href: '/track-repair',
      icon: 'fas fa-search',
      activeColor: 'text-purple-600'
    },
    {
      label: 'AI Fix',
      href: '/troubleshoot',
      icon: 'fas fa-robot',
      activeColor: 'text-amber-500'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1 group"
            >
              <div className={`text-xl transition-all duration-300 transform ${isActive ? `${item.activeColor} scale-110 -translate-y-1` : 'text-gray-400 group-hover:text-gray-600'}`}>
                <i className={item.icon}></i>
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${item.activeColor.replace('text-', 'bg-')}`}></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
