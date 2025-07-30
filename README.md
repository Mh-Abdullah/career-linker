# Career Linker 🚀

A modern, full-stack job board application built with Next.js 15, TypeScript, and Prisma. Career Linker connects job seekers with employers through an intuitive platform featuring advanced resume analysis, application tracking, and comprehensive dashboard management.

## ✨ Features

### For Job Seekers
- **User Authentication**: Secure registration and login with NextAuth.js (Email/Password & Google OAuth)
- **Profile Management**: Complete job seeker profiles with skills, experience, and education
- **Resume Upload**: PDF resume upload with automatic text extraction and analysis
- **Job Search & Filtering**: Advanced search by location, job type, company, and skills
- **Smart Job Matching**: Resume relevance scoring against job descriptions
- **Application Tracking**: Track application status and manage submitted applications
- **Real-time Dashboard**: Interactive dashboard with application analytics

### For Job Providers
- **Company Profiles**: Create detailed company profiles and branding
- **Job Posting Management**: Create, edit, and manage job postings with full CRUD operations
- **Application Management**: Review applications with detailed candidate information
- **Candidate Screening**: Advanced filtering and sorting of applications by status
- **Analytics Dashboard**: Track job performance, application metrics, and hiring statistics
- **Resume Analysis**: View candidate resumes and profiles with detailed information
- **Application Status Management**: Update application status (Pending, Reviewed, Interview, Accepted, Rejected)

### Technical Features
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live application status updates
- **File Management**: Secure resume upload and storage with PDF processing
- **Database Optimization**: Efficient queries with Prisma ORM and PostgreSQL
- **Type Safety**: Full TypeScript implementation with strict configurations
- **Modern UI**: Clean, professional interface with Tailwind CSS and Radix UI
- **Role-based Access Control**: Secure routing based on user types
- **API-First Architecture**: RESTful API design with comprehensive error handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI Components, Lucide React Icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: NextAuth.js with JWT tokens, Google OAuth, bcryptjs password hashing
- **File Processing**: PDF.js for resume text extraction, Formidable for file uploads
- **Charts**: Recharts for analytics visualization
- **UI Components**: Custom components with Radix UI primitives
- **Development Tools**: ESLint, TypeScript strict mode, Turbopack for fast development

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Mh-Abdullah/career-linker.git
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

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: View database in Prisma Studio
npx prisma studio
```

### 5. Start Development Server
```bash
npm run dev
# Uses Turbopack for faster development
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
career-linker/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── [...nextauth]/    # NextAuth configuration
│   │   │   ├── register/         # User registration
│   │   │   ├── change-password/  # Password management
│   │   │   ├── delete-account/   # Account deletion
│   │   │   └── update-user-type/ # User type updates
│   │   ├── jobs/          # Job management APIs
│   │   │   ├── [id]/             # Individual job operations
│   │   │   │   └── applications/ # Job-specific applications
│   │   │   └── available/        # Available jobs for seekers
│   │   ├── applications/  # Application management
│   │   │   └── [id]/            # Individual application operations
│   │   ├── dashboard/     # Dashboard statistics
│   │   │   ├── stats/           # Job provider statistics
│   │   │   └── active-users/    # Active user metrics
│   │   ├── job-provider/  # Job provider specific APIs
│   │   │   └── applications/    # All applications for provider
│   │   ├── upload/        # File upload handlers
│   │   │   └── resume/          # Resume upload processing
│   │   ├── simple/        # Simple API test endpoints
│   │   └── test/          # Testing endpoints
│   ├── auth/              # Authentication pages
│   │   ├── signin/              # Sign in page
│   │   ├── signup/              # Sign up page
│   │   └── select-user-type/    # User type selection
│   ├── dashboard/         # Dashboard pages
│   │   ├── job-seeker/          # Job seeker dashboard
│   │   │   ├── applications/    # Applied jobs view
│   │   │   └── job/            # Job details and application
│   │   └── job-provider/        # Job provider dashboard
│   │       ├── applications/    # Application management
│   │       └── create/         # Job creation
│   ├── api-test/          # API testing page
│   ├── script/            # Database migration scripts
│   ├── test/              # Test route
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage/landing page
│   ├── providers.tsx      # Theme and auth providers
│   ├── robots.ts          # SEO robots configuration
│   └── sitemap.ts         # SEO sitemap generation
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix UI based)
│   │   ├── avatar.tsx           # Avatar component
│   │   ├── button.tsx           # Button with multiple variants
│   │   ├── dialog.tsx           # Modal dialog component
│   │   └── dropdown-menu.tsx    # Dropdown menu component
│   ├── charts/           # Chart components
│   │   ├── bar-graph.tsx        # Bar chart visualization
│   │   ├── job-bar-chart.tsx    # Job-specific bar charts
│   │   └── line-chart.tsx       # Line chart component
│   ├── theme-provider.tsx      # Dark/light theme context
│   ├── theme-toggle.tsx        # Theme switching component
│   ├── simple-bar-chart.tsx    # Simple chart components
│   └── simple-pie-chart.tsx    # Pie chart visualization
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration & providers
│   ├── prisma.ts         # Prisma client initialization
│   └── utils.ts          # Helper functions and utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Complete database schema
│   ├── migrations/       # Database migration files
│   │   └── 20250705_baseline/   # Initial migration
│   └── generated/        # Generated Prisma client
├── public/               # Static assets
│   ├── pdfjs/           # PDF.js worker files
│   │   └── static/             # PDF processing assets
│   └── uploads/         # User uploaded files
│       └── resume/             # Resume file storage
├── types/                # TypeScript type definitions
│   ├── formidable.d.ts          # File upload types
│   ├── job.ts                   # Job interface definitions
│   └── next-auth.d.ts           # NextAuth type extensions
├── docs/                 # Project documentation
│   ├── API.md                   # Complete API documentation
│   ├── DEVELOPMENT.md           # Development setup guide
│   ├── DEPLOYMENT.md            # Deployment instructions
│   ├── USER-GUIDE.md            # User manual
│   └── README.md                # Documentation overview
├── components.json       # Radix UI configuration
├── middleware.ts         # Next.js middleware for auth
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
└── postcss.config.mjs    # PostCSS configuration
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

### Core Models
- **Users**: Authentication and user management with role-based access
  - Supports JOB_SEEKER, JOB_PROVIDER, and ADMIN user types
  - Integrated with NextAuth for secure authentication
- **JobSeekerProfile**: Comprehensive job seeker information
  - Personal details, skills, experience, education
  - Resume storage, LinkedIn/GitHub profiles, portfolio links
  - Availability and salary expectations
- **JobProviderProfile**: Company/employer information  
  - Company details, industry, size, location
  - Website, logo, founding year, contact information
- **Jobs**: Job postings with detailed information
  - Title, description, requirements, benefits
  - Location, salary, job type (Full-time, Part-time, Contract, etc.)
  - Remote work options, application deadlines
  - Active status management
- **Applications**: Job applications with status tracking
  - Application status (Pending, Reviewed, Interview, Accepted, Rejected, Withdrawn)
  - Cover letters, resume links, interview scheduling
  - Internal notes and feedback from recruiters

### Authentication Models (NextAuth)
- **Account**: OAuth provider account linking
- **Session**: User session management
- **VerificationToken**: Email verification and password reset

### Enums
- **UserType**: JOB_SEEKER, JOB_PROVIDER, ADMIN
- **JobType**: FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, REMOTE
- **ApplicationStatus**: PENDING, REVIEWED, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN

## 🔐 Authentication

Career Linker uses NextAuth.js for authentication with comprehensive security features:

### Authentication Methods
- **Email/password authentication** with bcryptjs password hashing
- **Google OAuth integration** for social login
- **JWT tokens** for secure session management
- **Role-based access control** (Job Seeker vs Job Provider vs Admin)

### Security Features
- Secure password hashing with bcryptjs (12 rounds)
- CSRF protection through NextAuth
- Session management with secure HTTP-only cookies
- Protected API routes with middleware authentication
- User type validation for role-based access

### Protected Routes
- Automatic redirection to sign-in for unauthenticated users
- Role-based dashboard routing
- Middleware-based route protection
- User type selection flow for new OAuth users

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration with profile creation
- `POST /api/auth/change-password` - Change user password
- `DELETE /api/auth/delete-account` - Delete user account and data
- `POST /api/auth/update-user-type` - Update user type for OAuth users

### Job Management
- `GET /api/jobs` - Get jobs (role-based: providers see own jobs)
- `POST /api/jobs` - Create new job posting (Job Provider only)
- `GET /api/jobs/[id]` - Get specific job details
- `PUT /api/jobs/[id]` - Update job posting (Job Provider only, own jobs)
- `DELETE /api/jobs/[id]` - Delete job posting (Job Provider only, own jobs)
- `GET /api/jobs/available` - Get all active jobs (Job Seeker only)

### Application Management  
- `POST /api/applications` - Submit job application (Job Seeker only)
- `GET /api/applications` - Get user's applications (Job Seeker only)
- `PUT /api/applications/[id]` - Update application status (Job Provider only)
- `GET /api/applications/[id]` - Get specific application details
- `GET /api/jobs/[id]/applications` - Get applications for specific job (Job Provider only)

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics (Job Provider only)
- `GET /api/dashboard/active-users` - Get active users count (Admin only)
- `GET /api/job-provider/applications` - Get all applications for provider's jobs

### File Upload
- `POST /api/upload/resume` - Upload resume files with validation

### Utility Endpoints
- `GET /api/simple` - Simple API test endpoint
- `POST /api/simple` - Simple POST test endpoint

For detailed API documentation with request/response examples, see [docs/API.md](docs/API.md)

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: User preference with system detection and smooth transitions
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Loading States**: Smooth loading indicators and skeleton screens throughout the app
- **Error Handling**: Comprehensive error messages, fallbacks, and user feedback
- **Interactive Components**: Modern UI with Radix UI primitives and custom styling
- **Performance**: Optimized with Next.js 15 and Turbopack for fast development
- **Professional Design**: Clean, modern interface with consistent color schemes and typography

## 🔧 Development

### Available Scripts

```bash
# Start development server with Turbopack
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

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Production build with migrations (Vercel)
npm run vercel-build
```

### Development Tools

This project uses:
- **ESLint** for code linting with Next.js specific rules
- **TypeScript** for type safety with strict configurations
- **Prettier** for code formatting (recommended)
- **Turbopack** for fast development builds
- **Prisma** for database management and type-safe queries

### Code Organization

- **Component-based architecture** with reusable UI components
- **API-first design** with consistent error handling
- **Type-safe development** with comprehensive TypeScript coverage
- **Modular structure** with clear separation of concerns
- **Custom hooks** for state management and API calls

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. Uses `vercel-build` script for production builds with migrations

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Deployment
- **PostgreSQL**: Recommended for production
- **PlanetScale**: MySQL-compatible serverless database
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple PostgreSQL deployment

### Build Optimization
- Next.js 15 with App Router for optimal performance
- Automatic static optimization
- Image optimization
- Bundle analysis and code splitting

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🤝 Contributing

We welcome contributions to Career Linker! Here's how you can help:

1. **Fork the repository**
   ```bash
   git clone https://github.com/Mh-Abdullah/career-linker.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow the coding standards outlined in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Contribution Guidelines
- **Code Quality**: Follow TypeScript and ESLint standards
- **Documentation**: Update relevant documentation for new features
- **Testing**: Add appropriate tests for new functionality
- **Commit Messages**: Use clear, descriptive commit messages
- **Issues**: Check existing issues before creating new ones

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🙏 Acknowledgments

Career Linker is built with and inspired by amazing open-source projects:

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[Recharts](https://recharts.org/)** - Redefined chart library
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icons
- **[PDF.js](https://mozilla.github.io/pdf.js/)** - PDF rendering in JavaScript

### Special Thanks
- The open-source community for amazing tools and libraries
- Contributors who help improve the platform
- Users who provide valuable feedback and suggestions

## 📞 Support & Contact

### Getting Help
- **📖 Documentation**: Comprehensive guides in the [docs/](docs/) folder
- **🐛 Bug Reports**: Create an issue on GitHub with detailed information
- **💡 Feature Requests**: Suggest new features through GitHub issues
- **💬 Discussions**: Join community discussions for general questions

### Professional Support
For enterprise support, custom development, or consultations:
- **Email**: [Contact via GitHub profile](https://github.com/Mh-Abdullah)
- **LinkedIn**: Connect for professional inquiries
- **Custom Development**: Available for feature development and integrations

### Community
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Pull Requests**: Contribute code improvements
- **Documentation**: Help improve guides and examples

---

**Built with ❤️ using modern web technologies. Star ⭐ this repository if you find it helpful!**

For detailed documentation, visit the [docs folder](docs/) or check out the [live documentation](docs/README.md).
