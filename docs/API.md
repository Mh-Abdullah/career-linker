# API Documentation

This document provides comprehensive information about the Career Linker API endpoints, including authentication, request/response formats, and usage examples.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All protected endpoints require authentication via NextAuth.js session cookies. Users are automatically redirected to the sign-in page if not authenticated.

### Authentication Methods
- **Session-based**: HTTP-only cookies (default)
- **Credentials**: Email/password with bcryptjs hashing
- **OAuth**: Google OAuth 2.0 integration

### User Types & Permissions
- `JOB_SEEKER`: Can apply for jobs, manage own applications, view available jobs
- `JOB_PROVIDER`: Can post jobs, manage own job postings, review applications for own jobs
- `ADMIN`: Full access to all resources (future implementation)

### Error Responses
All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details (development only)",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Common HTTP status codes:
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

## Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "userType": "JOB_SEEKER" // or "JOB_PROVIDER"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "userType": "JOB_SEEKER"
  }
}
```

#### `POST /api/auth/change-password`
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### `DELETE /api/auth/delete-account`
Delete user account and all associated data (requires authentication).

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

**Note**: This permanently deletes:
- User profile and authentication data
- All job postings (if Job Provider)
- All applications (if Job Seeker)
- Associated files and uploads

### Job Management

#### `GET /api/jobs`
Get jobs based on user type and permissions.

**Permissions:**
- **Job Provider**: Returns only jobs posted by the authenticated user
- **Admin**: Returns all jobs in the system
- **Job Seeker**: Returns 403 error (should use `/api/jobs/available`)

**Response:**
```json
[
  {
    "id": "job_id",
    "title": "Senior Software Developer",
    "description": "We are looking for an experienced developer...",
    "company": "Tech Corp",
    "location": "New York, NY",
    "salary": "$100,000 - $150,000",
    "jobType": "FULL_TIME",
    "experience": "5+ years",
    "skills": "JavaScript, React, Node.js, TypeScript",
    "requirements": "Bachelor's degree in Computer Science...",
    "benefits": "Health insurance, 401k, remote work options",
    "isActive": true,
    "isRemote": false,
    "applicationDeadline": "2024-02-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "_count": {
      "applications": 15
    }
  }
]
```

#### `POST /api/jobs`
Create a new job posting (Job Provider only).

**Request Body:**
```json
{
  "title": "Senior Software Developer",
  "description": "We are looking for an experienced developer...",
  "company": "Tech Corp",
  "location": "New York, NY",
  "salary": "$100,000 - $150,000",
  "jobType": "FULL_TIME", // FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, REMOTE
  "experience": "5+ years",
  "skills": "JavaScript, React, Node.js, TypeScript",
  "requirements": "Bachelor's degree in Computer Science...",
  "benefits": "Health insurance, 401k, remote work options",
  "isRemote": false,
  "applicationDeadline": "2024-02-01T00:00:00Z" // Optional
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": "new_job_id",
    "title": "Senior Software Developer",
    // ... other job fields
    "_count": {
      "applications": 0
    }
  }
}
```

#### `GET /api/jobs/[id]`
Get specific job details.

**Permissions:**
- **Job Provider**: Can view own jobs and basic info of other jobs
- **Job Seeker**: Can view all active jobs
- **Public**: Basic job information

**Response:**
```json
{
  "id": "job_id",
  "title": "Senior Software Developer",
  "description": "We are looking for an experienced developer...",
  "company": "Tech Corp",
  "location": "New York, NY",
  "salary": "$100,000 - $150,000",
  "jobType": "FULL_TIME",
  "experience": "5+ years",
  "skills": "JavaScript, React, Node.js, TypeScript",
  "requirements": "Bachelor's degree in Computer Science...",
  "benefits": "Health insurance, 401k, remote work options",
  "isActive": true,
  "isRemote": false,
  "applicationDeadline": "2024-02-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "postedBy": {
    "name": "John Smith",
    "jobProviderProfile": {
      "companyName": "Tech Corp",
      "website": "https://techcorp.com",
      "description": "Leading tech company"
    }
  },
  "_count": {
    "applications": 15
  }
}
```

#### `PUT /api/jobs/[id]`
Update job posting (Job Provider only, must own the job).

**Request Body:** Same as POST request with optional `id` field

**Response:**
```json
{
  "message": "Job updated successfully",
  "job": {
    // Updated job object
  }
}
```

#### `DELETE /api/jobs/[id]`
Delete job posting (Job Provider only, must own the job).

**Response:**
```json
{
  "message": "Job and all associated applications deleted successfully",
  "job": {
    "id": "job_id",
    "title": "Software Developer",
    "applicationsDeleted": 5
  }
}
```

#### `GET /api/jobs/available`
Get all available jobs for job seekers with filtering capabilities.

**Permissions:** Job Seeker only

**Query Parameters:**
- `search` (optional): Search in job title, description, company
- `jobType` (optional): Filter by job type
- `location` (optional): Filter by location

**Example:** `/api/jobs/available?search=developer&jobType=FULL_TIME&location=New York`

**Response:**
```json
[
  {
    "id": "job_id",
    "title": "Senior Software Developer",
    "description": "We are looking for an experienced developer...",
    "company": "Tech Corp",
    "location": "New York, NY",
    "salary": "$100,000 - $150,000",
    "jobType": "FULL_TIME",
    "isRemote": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "postedBy": {
      "name": "Tech Corp HR",
      "jobProviderProfile": {
        "companyName": "Tech Corp",
        "logo": "/uploads/logos/techcorp.png"
      }
    },
    "_count": {
      "applications": 15
    }
  }
]
```
Get all active jobs with optional filtering.

**Query Parameters:**
- `search` (optional): Search term for title, company, or skills
- `location` (optional): Filter by location
- `jobType` (optional): Filter by job type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Software Developer",
      "company": "Tech Corp",
      "location": "New York, NY",
      "salary": "$80,000 - $120,000",
      "jobType": "FULL_TIME",
      "description": "Job description...",
      "skills": "JavaScript, React, Node.js",
      "requirements": "3+ years experience",
      "benefits": "Health insurance, 401k",
      "isRemote": true,
      "applicationDeadline": "2024-12-31",
      "createdAt": "2024-01-01T00:00:00Z",
      "postedBy": {
        "jobProviderProfile": {
          "companyName": "Tech Corp",
          "website": "https://techcorp.com"
        }
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### `POST /api/jobs`
Create a new job posting (Job Provider only).

**Request Body:**
```json
{
  "title": "Software Developer",
  "description": "We are looking for...",
  "company": "Tech Corp",
  "location": "New York, NY",
  "salary": "$80,000 - $120,000",
  "jobType": "FULL_TIME",
  "experience": "3-5 years",
  "skills": "JavaScript, React, Node.js",
  "requirements": "Bachelor's degree in Computer Science",
  "benefits": "Health insurance, dental, vision, 401k",
  "isRemote": true,
  "applicationDeadline": "2024-12-31"
}
```

#### `GET /api/jobs/[id]`
Get specific job details.

**Response:**
```json
{
  "id": "job_id",
  "title": "Software Developer",
  "description": "Detailed job description...",
  "company": "Tech Corp",
  "location": "New York, NY",
  "salary": "$80,000 - $120,000",
  "jobType": "FULL_TIME",
  "experience": "3-5 years",
  "skills": "JavaScript, React, Node.js",
  "requirements": "Bachelor's degree required",
  "benefits": "Full benefits package",
  "isActive": true,
  "isRemote": true,
  "applicationDeadline": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "postedBy": {
    "id": "user_id",
    "name": "Company Admin",
    "jobProviderProfile": {
      "companyName": "Tech Corp",
      "website": "https://techcorp.com",
      "description": "Leading tech company"
    }
  },
  "_count": {
    "applications": 15
  }
}
```

#### `PUT /api/jobs/[id]`
Update job posting (Job Provider only, must own the job).

**Request Body:** Same as POST request

#### `DELETE /api/jobs/[id]`
Delete job posting (Job Provider only, must own the job).

**Response:**
```json
{
  "message": "Job and all associated applications deleted successfully",
  "job": {
    "id": "job_id",
    "title": "Software Developer",
    "applicationsDeleted": 5
  }
}
```

#### `GET /api/jobs/available`
Get all available jobs (similar to GET /api/jobs but with different filtering).

### Application Management

#### `POST /api/applications`
Submit a job application (Job Seeker only).

**Request Body:**
```json
{
  "jobId": "job_id",
  "coverLetter": "I am interested in this position...",
  "resumeUrl": "/uploads/resume/1234567890_john_doe_resume.pdf"
}
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": "application_id",
    "jobTitle": "Software Developer",
    "company": "Tech Corp",
    "status": "PENDING",
    "appliedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `GET /api/applications`
Get user's applications (Job Seeker only).

**Query Parameters:**
- `jobId` (optional): Filter by specific job

**Response:**
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "coverLetter": "Cover letter text...",
    "resume": "/uploads/resume/resume.pdf",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "job": {
      "id": "job_id",
      "title": "Software Developer",
      "company": "Tech Corp",
      "location": "New York, NY",
      "postedBy": {
        "jobProviderProfile": {
          "companyName": "Tech Corp"
        }
      }
    }
  }
]
```

#### `PUT /api/applications/[id]`
Update application status (Job Provider only).

**Request Body:**
```json
{
  "status": "REVIEWED", // PENDING, REVIEWED, INTERVIEW, ACCEPTED, REJECTED
  "notes": "Candidate looks promising",
  "interviewDate": "2024-02-01T10:00:00Z",
  "feedback": "Strong technical background"
}
```

#### `GET /api/jobs/[id]/applications`
Get applications for a specific job (Job Provider only, must own the job).

**Response:**
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "coverLetter": "I am very interested...",
    "resume": "/uploads/resume/resume.pdf",
    "createdAt": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "jobSeekerProfile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1-555-0123",
        "location": "New York, NY",
        "bio": "Experienced developer...",
        "skills": "JavaScript, React, Node.js",
        "experience": "5 years",
        "education": "BS Computer Science",
        "linkedinUrl": "https://linkedin.com/in/johndoe",
        "portfolio": "https://johndoe.dev"
      }
    }
  }
]
```

### File Upload

#### `POST /api/upload/resume`
Upload resume file with validation and processing.

**Content-Type:** `multipart/form-data`
**Permissions:** Authenticated users only

**Form Data:**
- `resume`: PDF file (required)

**Validation:**
- File size: Maximum 10MB
- File type: PDF only (.pdf extension)
- Filename sanitization and unique naming

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "url": "/uploads/resume/1234567890_sanitized_filename.pdf",
  "originalName": "original_resume.pdf",
  "size": 2048576,
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
```json
// File too large
{
  "error": "File size exceeds limit",
  "maxSize": "10MB"
}

// Invalid file type
{
  "error": "Invalid file type",
  "allowedTypes": ["application/pdf"]
}

// No file provided
{
  "error": "No file provided",
  "field": "resume"
}
```

### Dashboard & Analytics

#### `GET /api/dashboard/stats`
Get comprehensive dashboard statistics (Job Provider only).

**Permissions:** Job Provider only - returns stats for authenticated user's jobs

**Response:**
```json
{
  "activeJobs": 8,
  "totalApplications": 45,
  "recentApplications": 12, // Last 7 days
  "mostRecentJobApplications": 5,
  "jobPerformance": {
    "averageApplicationsPerJob": 5.6,
    "mostPopularJob": {
      "id": "job_id",
      "title": "Senior Developer",
      "applicationCount": 15
    }
  },
  "applicationTrends": {
    "thisWeek": 12,
    "lastWeek": 8,
    "percentageChange": 50
  }
}
```

#### `GET /api/dashboard/active-users`
Get active users statistics (Admin only).

**Permissions:** Admin only

**Response:**
```json
{
  "totalUsers": 1250,
  "activeUsers": 890,
  "jobSeekers": 950,
  "jobProviders": 300,
  "newUsersThisMonth": 145,
  "userGrowth": {
    "thisMonth": 145,
    "lastMonth": 120,
    "percentageChange": 20.8
  }
}
```

#### `GET /api/job-provider/applications`
Get all applications for job provider's jobs across all postings.

**Permissions:** Job Provider only

**Query Parameters:**
- `status` (optional): Filter by application status
- `limit` (optional): Limit number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z",
    "job": {
      "id": "job_id",
      "title": "Software Developer",
      "company": "Tech Corp"
    },
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "jobSeekerProfile": {
        "experience": "5 years",
        "location": "New York, NY"
      }
    }
  }
]
```

### Utility Endpoints

#### `GET /api/simple`
Simple API test endpoint for health checks and testing.

**Permissions:** Public access

**Response:**
```json
{
  "message": "API is working correctly",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

#### `POST /api/simple`
Simple POST endpoint for testing purposes.

**Permissions:** Public access

**Request Body:** Any JSON data

**Response:**
```json
{
  "message": "POST request received",
  "receivedData": {
    // Echo of sent data
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

All endpoints return consistent error responses with proper HTTP status codes and detailed error information.

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "details": "Additional technical details (development only)",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Insufficient permissions for the requested action
- **404 Not Found**: Requested resource does not exist
- **409 Conflict**: Resource conflict (e.g., duplicate application, email already exists)
- **422 Unprocessable Entity**: Request data is valid but cannot be processed
- **500 Internal Server Error**: Unexpected server error

### Authentication Errors
```json
// Missing session
{
  "error": "Unauthorized - No session found",
  "details": "User must be authenticated to access this resource"
}

// Wrong user type
{
  "error": "Only job seekers can apply for jobs",
  "userType": "JOB_PROVIDER"
}

// Insufficient permissions
{
  "error": "You can only view applications for your own jobs",
  "resourceOwner": "different_user_id"
}
```

### Validation Errors
```json
// Missing required fields
{
  "error": "Missing required fields: title, description, company, location",
  "fields": ["title", "description", "company", "location"]
}

// Invalid data format
{
  "error": "Invalid application deadline format",
  "expectedFormat": "ISO 8601 date string"
}
```

## Request/Response Guidelines

### Authentication
- All protected endpoints require a valid NextAuth.js session
- Session cookies are automatically handled by the browser
- No additional headers required for authentication

### Content Types
- **JSON endpoints**: `Content-Type: application/json`
- **File uploads**: `Content-Type: multipart/form-data`
- **Responses**: Always `application/json`

### Rate Limiting
Currently no rate limiting is implemented. For production deployment, consider implementing rate limiting to prevent abuse.

### File Upload Specifications
- **Resume files**: Maximum 10MB, PDF format only
- **File naming**: Automatic sanitization and unique timestamp prefixing
- **Storage**: Local filesystem under `/public/uploads/resume/`
- **Access**: Direct URL access for authenticated users

### Pagination
Some endpoints support pagination through query parameters:
- `limit`: Number of items per page (default varies by endpoint)
- `offset`: Number of items to skip
- `page`: Page number (alternative to offset)

### Database Transactions
All write operations use database transactions to ensure data consistency, especially for operations involving multiple related records (e.g., user registration with profile creation).

### Security Considerations
- All user inputs are validated and sanitized
- SQL injection prevention through Prisma ORM
- CSRF protection through NextAuth.js
- Secure file upload handling with type validation
- Password hashing using bcryptjs with 12 rounds

## Development & Testing

### API Testing
Use the `/api/simple` endpoints for basic connectivity testing. For comprehensive testing, consider using tools like:
- Postman collections
- Jest for unit testing
- Cypress for integration testing

### Environment-Specific Behavior
- **Development**: Detailed error messages with stack traces
- **Production**: Sanitized error messages without sensitive information
- **Logging**: Comprehensive request/response logging in development

---

For additional information about the application architecture and development setup, see:
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [User Guide](USER-GUIDE.md)
