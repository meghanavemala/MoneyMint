/*
The root server layout for the app.
*/

import { createProfileAction, getProfileByUserIdAction } from '@/actions/db/profiles-actions';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/utilities/providers';
import { TailwindIndicator } from '@/components/utilities/tailwind-indicator';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sandeep Finance - Digital Khata Book',
  description:
    'Modern digital khata book for Indian money lenders. Track customers, transactions, and daily collections in Rupees.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // Skip profile check if we're on the test-auth page to prevent loops
  // Note: This check is not needed in server component as window is not available

  if (userId) {
    try {
      const profileRes = await getProfileByUserIdAction(userId);
      if (!profileRes.isSuccess) {
        console.log('Profile not found, creating new profile...');
        await createProfileAction({ userId });
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
      // Continue rendering the app even if profile check fails
    }
  }

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/80',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            'mx-auto min-h-screen w-full scroll-smooth bg-background antialiased',
            inter.className
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
