/*
This client component provides the hero section for the landing page.
*/

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronRight, Rocket, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import AnimatedGradientText from '../magicui/animated-gradient-text';
import HeroVideoDialog from '../magicui/hero-video-dialog';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const HeroSection = () => {
  // Use a fixed array for rupee drop positions to avoid hydration mismatch
  const rupeeDropConfig = [
    { left: 5, delay: 0.2, size: 32, opacity: 0.15 },
    { left: 15, delay: 1.1, size: 40, opacity: 0.18 },
    { left: 25, delay: 2.0, size: 28, opacity: 0.13 },
    { left: 35, delay: 0.7, size: 36, opacity: 0.17 },
    { left: 45, delay: 1.5, size: 48, opacity: 0.21 },
    { left: 55, delay: 2.3, size: 30, opacity: 0.14 },
    { left: 65, delay: 0.9, size: 38, opacity: 0.19 },
    { left: 75, delay: 1.8, size: 44, opacity: 0.16 },
    { left: 85, delay: 2.7, size: 34, opacity: 0.12 },
    { left: 95, delay: 1.3, size: 42, opacity: 0.2 },
    { left: 12, delay: 2.5, size: 29, opacity: 0.14 },
    { left: 22, delay: 0.4, size: 35, opacity: 0.16 },
    { left: 62, delay: 1.7, size: 39, opacity: 0.18 },
    { left: 72, delay: 2.2, size: 33, opacity: 0.13 },
    { left: 82, delay: 0.6, size: 37, opacity: 0.15 },
    { left: 92, delay: 1.9, size: 41, opacity: 0.17 },
  ];
  const rupeeDrops = rupeeDropConfig.map((cfg, i) => (
    <IndianRupee
      key={i}
      className="animate-drop absolute"
      style={{
        left: `${cfg.left}%`,
        top: '-40px',
        animationDelay: `${cfg.delay}s`,
        fontSize: `${cfg.size}px`,
        opacity: cfg.opacity,
        color: '#22c55e',
      }}
    />
  ));

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-8 pt-32 text-center">
      {/* Animated Rupee Background */}
      <div className="pointer-events-none absolute inset-0 z-0 size-full overflow-hidden">
        {rupeeDrops}
      </div>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="text-balance font-bold text-green-600"
            style={{ fontFamily: 'Futura Display', fontSize: '4rem', letterSpacing: '0.01em' }}
          >
            Money Mint
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            className="max-w-xl text-balance text-xl text-gray-700"
            style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
          >
            Where money meets clarity
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
          >
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-green-600 text-lg hover:bg-green-700">Go to Dashboard</Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/dashboard">
                <Button className="mr-2 bg-green-600 text-lg hover:bg-green-700">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" className="text-lg">
                  Create Free Account
                </Button>
              </Link>
            </SignedOut>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
