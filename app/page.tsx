"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      {/* Navigation */}
      <nav className="mb-12 flex flex-wrap justify-center gap-8 text-lg font-medium">
        <Link href="/about" className="hover:text-primary transition-colors">
          About
        </Link>
        <Link href="/features" className="hover:text-primary transition-colors">
          Features
        </Link>
        <Link href="/pricing" className="hover:text-primary transition-colors">
          Pricing
        </Link>
        <Link href="/contact" className="hover:text-primary transition-colors">
          Contact
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Welcome to <span className="text-primary">YourFinance</span>
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl">
          A modern finance tracker that helps you manage customers,
          transactions, and collections effortlessly.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/features">Learn More</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
