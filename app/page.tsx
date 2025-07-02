import Link from "next/link"
import { Button } from "../components/ui/button"
import { ThemeToggle } from "../components/theme-toggle" // ✅ NEW

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Navigation Bar */}
      <nav className="py-6 border-b border-border">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#00A8A8] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">CL</span>
            </div>
            <span className="text-2xl font-semibold text-[#00A8A8]">CareerLinker</span>
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle /> {/* ✅ Added toggle here */}
            <Link href="/auth/signup">
              <Button variant="ghost" className="hover:text-[#00A8A8]">
                Register
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="px-6">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-left">
          <h1 className="text-5xl font-bold leading-tight mb-8 text-foreground dark:text-foreground">
            Connect to Your Dream Career with <span className="text-[#00A8A8]">CareerLinker</span>
          </h1>

          <p className="text-xl mb-12 leading-relaxed max-w-3xl text-muted-foreground dark:text-white/80">
            Find the perfect job match with our intelligent platform. We connect talented professionals with top
            companies worldwide, making your career journey seamless and rewarding.
          </p>

          <div className="flex items-center gap-4 mb-12">
            <Link href="/auth/signin">
              <Button size="lg" variant="accent" className="px-8 flex items-center">
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
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-muted-foreground dark:text-white/80">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
