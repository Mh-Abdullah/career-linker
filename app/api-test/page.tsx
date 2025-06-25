"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([])

  const testEndpoints = async () => {
    const endpoints = ["/api/simple", "/api/jobs", "/api/test"]

    const newResults: string[] = []

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        const text = await response.text()
        newResults.push(`${endpoint}: ${response.status} - ${text}`)
      } catch (error) {
        newResults.push(`${endpoint}: ERROR - ${error}`)
      }
    }

    setResults(newResults)
  }

  const testPost = async () => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Job",
          description: "Test Description",
          company: "Test Company",
          location: "Test Location",
        }),
      })

      const text = await response.text()
      setResults((prev) => [...prev, `POST /api/jobs: ${response.status} - ${text}`])
    } catch (error) {
      setResults((prev) => [...prev, `POST /api/jobs: ERROR - ${error}`])
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2B2D42] mb-8">API Test Page</h1>

        <div className="space-y-4 mb-8">
          <Button onClick={testEndpoints} className="bg-[#00A8A8] hover:bg-[#009494]">
            Test GET Endpoints
          </Button>
          <Button onClick={testPost} className="bg-[#3B3B98] hover:bg-[#323280] ml-4">
            Test POST /api/jobs
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Results:</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected File Structure:</h3>
          <pre className="text-sm text-yellow-700">
            {`app/
├── api/
│   ├── simple/
│   │   └── route.ts
│   ├── jobs/
│   │   └── route.ts
│   └── test/
│       └── route.ts
├── api-test/
│   └── page.tsx
└── dashboard/
    └── job-provider/
        └── page.tsx`}
          </pre>
        </div>
      </div>
    </div>
  )
}
