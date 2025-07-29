/*
Landing page for Sandeep Finance - a comprehensive finance tracking app for money lenders.
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

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description:
        'Add and manage customer details including name, phone, address, and notes - just like your khata book.',
    },
    {
      icon: IndianRupee,
      title: 'Transaction Tracking',
      description:
        'Record credits (udhaar) and payments (wapsi) with real-time balance updates in Rupees.',
    },
    {
      icon: Zap,
      title: 'Daily Collections',
      description:
        'View daily transaction summaries with calendar navigation and color-coded entries.',
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description:
        'Generate professional customer statements and daily collection reports for your records.',
    },
    {
      icon: BarChart3,
      title: 'Financial Overview',
      description:
        'Get complete overview of total outstanding, credits given, and collections made.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'Your data is secure and private. Only you can access your customer information.',
    },
  ];

  const benefits = [
    'No more manual balance calculations',
    'Instant transaction recording and updates',
    'Professional PDF reports for customers',
    'Daily collection tracking and summaries',
    'Secure cloud storage of all data',
    'Access from anywhere, anytime',
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                SF
              </div>
              <span className="text-xl font-bold">Sandeep Finance</span>
            </Link>
            <div className="hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link href="#features" className="transition-colors hover:text-primary">
                Features
              </Link>
              <Link href="#benefits" className="transition-colors hover:text-primary">
                Benefits
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-primary">
                Pricing
              </Link>
            </div>
          </div>

          {/* Profile/Auth Section */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:flex"
                >
                  Dashboard
                </Button>
                <div className="flex items-center gap-2 rounded-full border p-1 pr-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.firstName || user.username}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button variant="outline">Log in</Button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button>Sign up</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Digital Khata Book
            <br />
            <span className="text-blue-600">for Indian Money Lenders</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Transform your traditional khata book into a modern digital solution. Track customers,
            manage transactions, and monitor daily collections with ease - all in Indian Rupees.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Your Digital Khata
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Create Free Account
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold">Complete Digital Khata Solution</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to manage your money lending business digitally, just like your
              traditional khata book but with modern features.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <feature.icon className="size-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                  <Check className="mr-2 size-4 text-yellow-500" />
                  Digital Khata Book
                </div>
                <h2 className="text-3xl font-bold">Why Choose Digital Khata?</h2>
                <p className="text-lg text-muted-foreground">
                  Transform your traditional khata book into a modern digital solution that saves
                  time, reduces errors, and provides better organization.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="size-5 shrink-0 text-green-600" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <Zap className="size-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Save Time</h3>
                    <p className="text-sm text-muted-foreground">No more manual calculations</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatic balance calculations and instant transaction recording save hours of
                  manual work every day.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <Shield className="size-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Reduce Errors</h3>
                    <p className="text-sm text-muted-foreground">Accurate calculations</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Eliminate calculation mistakes and ensure accurate balance tracking with automated
                  computations.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <FileText className="size-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Professional Reports</h3>
                    <p className="text-sm text-muted-foreground">PDF statements</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate professional customer statements and daily collection reports for your
                  business records.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and scale as your business grows.
            </p>
          </div>

          <div className="mx-auto max-w-lg">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-blue-600" />
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Forever</CardTitle>
                <CardDescription>Perfect for small to medium finance businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    'Unlimited customers',
                    'Unlimited transactions',
                    'PDF report generation',
                    'Daily collection tracking',
                    'Secure cloud storage',
                    'Mobile responsive design',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="size-5 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {isSignedIn ? (
                    <Button className="w-full" asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <Button className="w-full">Get Started Free</Button>
                    </SignUpButton>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                SF
              </div>
              <span className="text-lg font-bold">Sandeep Finance</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 Sandeep Finance. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
