/*
This client component provides a theme switcher for the app.
Handles hydration properly by avoiding server/client mismatches.
*/

'use client';

import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { HTMLAttributes, ReactNode, useEffect, useState } from 'react';

interface ThemeSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const ThemeSwitcher = ({ children, ...props }: ThemeSwitcherProps) => {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (newTheme: 'dark' | 'light') => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className={cn('p-1', props.className)} style={{ width: '24px', height: '24px' }} />;
  }

  return (
    <div
      className={cn('p-1 hover:cursor-pointer hover:opacity-50', props.className)}
      onClick={() => handleChange(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      {resolvedTheme === 'dark' ? <Moon className="size-6" /> : <Sun className="size-6" />}
    </div>
  );
};
