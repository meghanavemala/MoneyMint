'use client';

import { ThemeSwitcher } from '@/components/utilities/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold">Digital Khata Book</h1>
          <p className="text-sm text-muted-foreground">
            Manage your money lending business digitally
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher className="size-9" />
        </div>
      </div>
    </header>
  );
}
