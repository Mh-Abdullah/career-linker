"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "../../../components/ui/button"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "JOB_SEEKER",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // ✅ Error state
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear old error
    setIsLoading(true)

    // ✅ Password mismatch check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?message=Registration successful")
      } else {
        const data = await response.json()

        // ✅ Email already exists error
        if (data.message === "Email already exists") {
          setError("An account with this email already exists.")
        } else {
          setError(data.message || "Registration failed.")
        }

        setIsLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-md w-96 text-foreground border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Join CareerLinker</h1>
          <p className="text-foreground/80 mt-2">Create your account</p>
        </div>

        {/* ✅ Error Display */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-foreground mb-1">
              I am a
            </label>
            <select
              id="userType"
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black"
            >
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="JOB_PROVIDER">Job Provider</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              {formData.userType === "JOB_PROVIDER" ? "Company Name" : "Full Name"}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black placeholder:text-black/60"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black placeholder:text-black/60"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black placeholder:text-black/60"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black placeholder:text-black/60"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-foreground/80 mt-6">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-purple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
