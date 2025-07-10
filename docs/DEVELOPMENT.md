# Development Guide

This guide helps developers understand the Career Linker codebase and contribute effectively.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [Database Management](#database-management)
- [Authentication Flow](#authentication-flow)
- [File Upload System](#file-upload-system)
- [Testing](#testing)
- [Code Style & Standards](#code-style--standards)
- [Contributing Guidelines](#contributing-guidelines)

## Project Architecture

Career Linker is built using modern web development practices with a focus on type safety, performance, and maintainability.

### Tech Stack Overview

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT tokens
- **File Processing**: PDF.js for resume text extraction
- **Charts**: Recharts for data visualization

### Architecture Patterns

- **Component-Based**: Reusable UI components with clear separation of concerns
- **API-First**: RESTful API design with consistent error handling
- **Type-Safe**: End-to-end TypeScript with strict configurations
- **Responsive Design**: Mobile-first approach with dark/light theme support

## Development Setup

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git for version control

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/career-linker.git
   cd career-linker
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/career_linker"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-development-secret-key"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Optional: Seed database with sample data
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type check
npx tsc --noEmit

# Database commands
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create and apply migration
npx prisma migrate reset   # Reset database
npx prisma db push         # Push schema changes without migration
```

## Code Structure

### Directory Organization

```
app/                    # Next.js App Router
├── api/               # API route handlers
│   ├── auth/          # Authentication endpoints
│   ├── jobs/          # Job management APIs
│   ├── applications/  # Application APIs
│   └── upload/        # File upload handlers
├── auth/              # Authentication pages
├── dashboard/         # Protected dashboard pages
│   ├── job-seeker/    # Job seeker interface
│   └── job-provider/  # Job provider interface
├── globals.css        # Global styles
├── layout.tsx         # Root layout
├── page.tsx           # Homepage
└── providers.tsx      # Context providers

components/            # Reusable components
├── ui/               # Base UI components (buttons, dialogs, etc.)
├── charts/           # Chart components
├── theme-provider.tsx
└── theme-toggle.tsx

lib/                  # Utility libraries
├── auth.ts           # NextAuth configuration
├── prisma.ts         # Prisma client instance
└── utils.ts          # Helper functions

prisma/               # Database
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

types/                # TypeScript definitions
├── job.ts            # Job-related types
├── next-auth.d.ts    # NextAuth type extensions
└── formidable.d.ts   # Formidable type definitions

public/               # Static assets
└── uploads/          # User uploaded files
```

### Component Architecture

#### UI Components (`components/ui/`)

Base components built on Radix UI primitives:

```typescript
// components/ui/button.tsx
import { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### Feature Components

Feature-specific components with business logic:

```typescript
// app/dashboard/job-seeker/apply-modal.tsx
interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
  companyName: string
}

export default function ApplyModal({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle, 
  companyName 
}: ApplyModalProps) {
  // Component logic here
}
```

## Database Management

### Schema Design

The database schema is defined in `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  password      String?
  userType      UserType  @default(JOB_SEEKER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts           Account[]
  sessions           Session[]
  jobSeekerProfile   JobSeekerProfile?
  jobProviderProfile JobProviderProfile?
  jobs               Job[]
  applications       Application[]

  @@map("users")
}

model Job {
  id                  String    @id @default(cuid())
  title               String    @db.VarChar(200)
  description         String    @db.Text
  company             String    @db.VarChar(200)
  location            String    @db.VarChar(200)
  salary              String?   @db.VarChar(100)
  jobType             JobType   @default(FULL_TIME)
  experience          String?   @db.VarChar(50)
  skills              String?   @db.Text
  requirements        String?   @db.Text
  benefits            String?   @db.Text
  isActive            Boolean   @default(true)
  isRemote            Boolean   @default(false)
  applicationDeadline DateTime?
  postedById          String    @map("posted_by_id")
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  postedBy     User          @relation(fields: [postedById], references: [id], onDelete: Cascade)
  applications Application[]

  @@map("jobs")
}
```

### Migrations

1. **Create Migration**
   ```bash
   npx prisma migrate dev --name "description-of-changes"
   ```

2. **Apply Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Reset Database**
   ```bash
   npx prisma migrate reset
   ```

### Database Queries

Use Prisma Client for type-safe database access:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Example usage in API route
export async function GET(request: NextRequest) {
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    include: {
      postedBy: {
        select: {
          jobProviderProfile: {
            select: {
              companyName: true,
              website: true
            }
          }
        }
      },
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json(jobs)
}
```

## Authentication Flow

### NextAuth.js Configuration

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            jobSeekerProfile: true,
            jobProviderProfile: true
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.userType = token.userType as string
      }
      return session
    }
  }
}
```

### Protected Routes

```typescript
// app/dashboard/job-seeker/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function JobSeekerDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  if (session.user.userType !== "JOB_SEEKER") {
    redirect("/dashboard/job-provider")
  }
  
  return <JobSeekerDashboardComponent />
}
```

## File Upload System

### Upload Handler

```typescript
// app/api/upload/resume/route.ts
import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import formidable from "formidable"

export async function POST(req: Request): Promise<Response> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resume")
  await fs.mkdir(uploadDir, { recursive: true })

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name: string, ext: string, part: { originalFilename: string }) => {
      return `${Date.now()}_${part.originalFilename}`
    },
  })

  // Process upload logic...
}
```

### PDF Text Extraction

```typescript
// Resume text extraction using PDF.js
async function extractResumeTextFromPDF(url: string) {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/static/pdf.worker.min.js'
    
    const loadingTask = pdfjsLib.getDocument(url)
    const pdf = await loadingTask.promise
    
    let text = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items
        .filter((item): item is TextItem => typeof item === 'object' && 'str' in item)
        .map((item) => (item as TextItem).str)
        .join(" ") + " "
    }
    
    return text
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    return ""
  }
}
```

## Testing

### Setup Testing Environment

1. **Install Dependencies**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   ```

2. **Jest Configuration** (`jest.config.js`)
   ```javascript
   const nextJest = require('next/jest')
   
   const createJestConfig = nextJest({
     dir: './',
   })
   
   const customJestConfig = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleDirectories: ['node_modules', '<rootDir>/'],
     testEnvironment: 'jest-environment-jsdom',
   }
   
   module.exports = createJestConfig(customJestConfig)
   ```

### Component Testing

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders a button with text', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })
  
  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

### API Testing

```typescript
// __tests__/api/jobs.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/jobs/route'

describe('/api/jobs', () => {
  it('returns jobs list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data)).toBe(true)
  })
})
```

## Code Style & Standards

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration

```json
// eslint.config.mjs
import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "prefer-const": "error"
    }
  }
]

export default eslintConfig
```

### Naming Conventions

- **Components**: PascalCase (`JobDetailModal.tsx`)
- **Files**: kebab-case (`job-detail-modal.tsx`)
- **Variables**: camelCase (`applicationCount`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`JobApplication`, `UserProfile`)

### Component Structure

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Types
interface ComponentProps {
  title: string
  onAction: () => void
}

// Component
export default function ComponentName({ title, onAction }: ComponentProps) {
  // State
  const [isLoading, setIsLoading] = useState(false)
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // Handlers
  const handleClick = () => {
    setIsLoading(true)
    onAction()
  }
  
  // Render
  return (
    <div className="container">
      <h1>{title}</h1>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </Button>
    </div>
  )
}
```

## Contributing Guidelines

### Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation

3. **Test Locally**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add job filtering by location"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Responsive design tested
- [ ] Accessibility considered
- [ ] Performance impact evaluated

## Debugging

### Common Issues

1. **Prisma Client Out of Sync**
   ```bash
   npx prisma generate
   ```

2. **Database Connection Issues**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

3. **NextAuth Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches current domain
   - Clear browser cookies

4. **Build Errors**
   - Run type check: `npx tsc --noEmit`
   - Check for missing dependencies
   - Verify environment variables

### Development Tools

- **Prisma Studio**: Visual database browser
  ```bash
  npx prisma studio
  ```

- **Next.js DevTools**: Browser extension for debugging
- **React DevTools**: Component inspection
- **Network Tab**: API request debugging
