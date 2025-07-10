# Career Linker 🚀

A modern, full-stack job board application built with Next.js 15, TypeScript, and Prisma. Career Linker connects job seekers with employers through an intuitive platform featuring advanced resume analysis, application tracking, and comprehensive dashboard management.

## ✨ Features

### For Job Seekers
- **User Authentication**: Secure registration and login with NextAuth.js
- **Profile Management**: Complete job seeker profiles with skills, experience, and education
- **Resume Upload**: PDF resume upload with automatic text extraction and analysis
- **Job Search & Filtering**: Advanced search by location, job type, company, and skills
- **Smart Job Matching**: Resume relevance scoring against job descriptions
- **Application Tracking**: Track application status and manage submitted applications
- **Real-time Notifications**: Get updates on application status changes

### For Job Providers
- **Company Profiles**: Create detailed company profiles and branding
- **Job Posting Management**: Create, edit, and manage job postings
- **Application Management**: Review applications with resume analysis tools
- **Candidate Screening**: Advanced filtering and sorting of applications
- **Communication Tools**: Direct contact with candidates via email integration
- **Analytics Dashboard**: Track job performance and application metrics
- **Resume Analysis**: AI-powered resume relevance scoring

### Technical Features
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live application status updates
- **File Management**: Secure resume upload and storage
- **Database Optimization**: Efficient queries with Prisma ORM
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **File Processing**: PDF.js for resume text extraction
- **Charts**: Recharts for analytics visualization
- **UI Components**: Custom components with Radix UI primitives

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/career-linker.git
cd career-linker
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/career_linker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Optional: Add OAuth providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed the database
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
career-linker/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── jobs/          # Job management APIs
│   │   ├── applications/  # Application management
│   │   └── upload/        # File upload handlers
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── job-seeker/    # Job seeker dashboard
│   │   └── job-provider/  # Job provider dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── charts/           # Chart components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
│   └── uploads/          # User uploaded files
└── types/                # TypeScript type definitions
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and user management
- **JobSeekerProfile**: Job seeker specific information
- **JobProviderProfile**: Company/employer information  
- **Jobs**: Job postings and details
- **Applications**: Job applications and status tracking

## 🔐 Authentication

Career Linker uses NextAuth.js for authentication with support for:
- Email/password authentication
- JWT tokens for session management
- Role-based access control (Job Seeker vs Job Provider)
- Secure password hashing with bcryptjs

## 📱 API Documentation

### Job Management
- `GET /api/jobs` - Get all active jobs
- `POST /api/jobs` - Create new job posting
- `GET /api/jobs/[id]` - Get specific job details
- `PUT /api/jobs/[id]` - Update job posting
- `DELETE /api/jobs/[id]` - Delete job posting

### Application Management  
- `POST /api/applications` - Submit job application
- `GET /api/applications` - Get user's applications
- `PUT /api/applications/[id]` - Update application status

### File Upload
- `POST /api/upload/resume` - Upload resume files

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: User preference with system detection
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Loading States**: Smooth loading indicators throughout the app
- **Error Handling**: Comprehensive error messages and fallbacks

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Code Style

This project uses:
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (recommended)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Database management with [Prisma](https://www.prisma.io/)
- Charts powered by [Recharts](https://recharts.org/)

---

For support or questions, please open an issue on GitHub.
