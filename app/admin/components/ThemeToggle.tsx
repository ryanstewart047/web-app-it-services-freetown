'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    
    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('admin-theme', newTheme);
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <button className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all">
        <span className="text-lg">🌙</span>
      </button>
    );
  }

  return (
    <button 
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all active:scale-95 shadow-sm"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-lg block">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  );
}
