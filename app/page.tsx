/*
Landing page for MoneyMint - a comprehensive personal finance tracking app.
Features modern design, theme toggle, and clear value proposition.
*/

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ThemeSwitcher } from '@/components/utilities/theme-switcher';
import {
  ArrowRight,
  Check,
  IndianRupee,
  Shield,
  Zap,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <HeroSection />
      <div className="min-h-[30vh] py-24" />
      <footer className="mt-12 border-t py-8">
        <div
          className="mx-auto flex max-w-lg flex-col items-center justify-between space-y-4 text-center"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="flex w-full items-center justify-center space-x-6 text-sm text-muted-foreground">
            <span>© 2024 Money Mint. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
