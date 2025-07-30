'use client';

import { ThemeSwitcher } from '@/components/utilities/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-end gap-2 border-b bg-background/95 px-2 backdrop-blur-sm md:h-14 md:gap-4 md:px-4">
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher className="size-7 md:size-8 lg:size-9" />
        {/* UserButton should be here if you want to show it */}
      </div>
    </header>
  );
}
