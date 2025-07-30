'use client';

import { ThemeSwitcher } from '@/components/utilities/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher className="size-8 md:size-9" />
        {/* UserButton should be here if you want to show it */}
      </div>
    </header>
  );
}
