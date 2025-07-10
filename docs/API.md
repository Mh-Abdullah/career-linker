# API Documentation

This document provides detailed information about the Career Linker API endpoints.

## Authentication

All protected endpoints require authentication via NextAuth.js session cookies. Users are automatically redirected to the sign-in page if not authenticated.

### User Types
- `JOB_SEEKER`: Can apply for jobs, manage applications
- `JOB_PROVIDER`: Can post jobs, manage applications received

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
Delete user account (requires authentication).

### Job Management

#### `GET /api/jobs`
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
Upload resume file.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `resume`: PDF file (max 10MB)

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "url": "/uploads/resume/1234567890_resume.pdf"
}
```

### Dashboard Endpoints

#### `GET /api/dashboard/stats`
Get dashboard statistics (Job Provider only).

**Response:**
```json
{
  "totalJobs": 10,
  "activeJobs": 8,
  "totalApplications": 45,
  "pendingApplications": 20,
  "jobsByType": [
    {"type": "FULL_TIME", "count": 6},
    {"type": "PART_TIME", "count": 2},
    {"type": "CONTRACT", "count": 2}
  ],
  "applicationsByStatus": [
    {"status": "PENDING", "count": 20},
    {"status": "REVIEWED", "count": 15},
    {"status": "INTERVIEW", "count": 8},
    {"status": "ACCEPTED", "count": 2}
  ]
}
```

#### `GET /api/dashboard/active-users`
Get active users count (Admin only).

#### `GET /api/job-provider/applications`
Get all applications for job provider's jobs.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (in development)"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `409`: Conflict (e.g., duplicate application)
- `500`: Internal server error

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended to add rate limiting for production use.

## File Upload Limits

- Resume files: Maximum 10MB
- Supported formats: PDF only
- Files are stored in `/public/uploads/resume/` directory
