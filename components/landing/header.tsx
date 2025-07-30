/*
This client component provides the header for the app.
*/

'use client';

import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Menu, Receipt, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from '@/components/utilities/theme-switcher';

const signedInLinks = [{ href: '/dashboard', label: 'Dashboard' }];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 bg-transparent transition-colors`}
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between p-4">
        <motion.div
          className="flex items-center space-x-2 hover:cursor-pointer hover:opacity-80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="https://bahvvtynjvbocjfxgnbm.supabase.co/storage/v1/object/public/logo//moneymint.png"
            alt="Money Mint Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <Link href="/" className="text-xl font-bold text-green-600">
            Money Mint
          </Link>
        </motion.div>

        <div className="hidden items-center space-x-6 md:flex">
          <Link
            href="/dashboard"
            className="text-base font-medium transition-colors hover:text-green-600"
          >
            Customer Dashboard
          </Link>
          <Link
            href="/dashboard?tab=add-entry"
            className="text-base font-medium transition-colors hover:text-green-600"
          >
            Add Entry
          </Link>
          <Link
            href="/dashboard?tab=daily-collection"
            className="text-base font-medium transition-colors hover:text-green-600"
          >
            Daily Collection
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Sign In</Button>
              </motion.div>
            </SignInButton>
            <SignUpButton>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button>Get Started</Button>
              </motion.div>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ThemeSwitcher />
          <motion.div className="md:hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </motion.div>
        </div>
      </div>
      {isMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-primary-foreground p-4 text-primary md:hidden"
        >
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block hover:underline" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="block hover:underline" onClick={toggleMenu}>
                Customer Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard?tab=add-entry"
                className="block hover:underline"
                onClick={toggleMenu}
              >
                Add Entry
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard?tab=daily-collection"
                className="block hover:underline"
                onClick={toggleMenu}
              >
                Daily Collection
              </Link>
            </li>
          </ul>
        </motion.nav>
      )}
    </motion.header>
  );
}
