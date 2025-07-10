"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { ThemeToggle } from "../components/theme-toggle"

export default function WelcomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors relative">
      {/* Navigation Bar */}
      <nav className="py-4 md:py-6 border-b border-border relative z-20">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <span className="text-white font-bold text-md sm:text-lg">CL</span>
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-purple-600">CareerLinker</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/signup">
              <Button variant="ghost" className="hover:text-purple-700 hover:">Register</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="px-6">Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown (Floating Box Style) */}
        {menuOpen && (
          <div className="absolute top-20 right-4 w-52 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-1 flex flex-col gap-2 z-50 border border-border">
            <div className="flex items-center justify-between px-2 text-foreground">
              <ThemeToggle />
            </div>
            <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
              <Button
                variant="ghost"
                className="justify-start w-full text-left text-foreground hover:bg-accent/30 dark:hover:bg-white/10"
              >
                Register
              </Button>
            </Link>
            <Link href="/auth/signin" onClick={() => setMenuOpen(false)}>
              <Button
                variant="ghost"
                className="justify-start w-full text-left text-foreground hover:bg-accent/30 dark:hover:bg-white/10"
              >
                Login
              </Button>
            </Link>
          </div>
        )}

      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-5xl">
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 sm:mb-8 text-foreground dark:text-foreground">
            Connect to Your Dream Career with <span className="text-purple-600">CareerLinker</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 leading-relaxed max-w-3xl text-muted-foreground dark:text-white/80">
            Find the perfect job match with our intelligent platform. We connect talented professionals with top
            companies worldwide, making your career journey seamless and rewarding.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/auth/signin">
              <Button size="lg" variant="accent" className="px-6 sm:px-8 flex items-center">
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-6 sm:px-8">
              Learn More
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="text-sm sm:text-base text-muted-foreground dark:text-white/80">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
