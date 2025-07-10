# Deployment Guide

This guide covers deploying Career Linker to various platforms.

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Career Linker as it's optimized for Next.js applications.

### Prerequisites
- GitHub repository with your code
- Vercel account
- PostgreSQL database (we recommend PlanetScale or Supabase)

### Step 1: Database Setup

#### Option A: PlanetScale (Recommended)
1. Create a PlanetScale account at https://planetscale.com
2. Create a new database
3. Get your connection string from the dashboard
4. The connection string format: `mysql://username:password@host/database?sslaccept=strict`

#### Option B: Supabase
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. The connection string format: `postgresql://username:password@host:port/database`

#### Option C: Railway
1. Create a Railway account at https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string from the database dashboard

### Step 2: Vercel Setup

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build` (automatically configured)
   - Output Directory: `.next` (default)

3. **Environment Variables**
   Add the following environment variables in Vercel dashboard:

   ```env
   # Database
   DATABASE_URL="your-production-database-url"
   
   # NextAuth
   NEXTAUTH_URL="https://your-app-name.vercel.app"
   NEXTAUTH_SECRET="your-super-secret-production-key"
   
   # Optional: OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Step 3: Database Migration

After deployment, run database migrations:

1. **Using Vercel CLI** (Recommended)
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Using GitHub Actions** (Alternative)
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Vercel
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm ci
         - run: npx prisma migrate deploy
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
         - uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.ORG_ID }}
             vercel-project-id: ${{ secrets.PROJECT_ID }}
   ```

## Docker Deployment

### Dockerfile
Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/career_linker
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
    volumes:
      - ./public/uploads:/app/public/uploads

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: career_linker
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Build and Run
```bash
# Build and start
docker-compose up --build

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## Railway Deployment

1. **Connect Repository**
   - Go to https://railway.app
   - Create new project from GitHub repo

2. **Add Database**
   - Click "Add Service" > "Database" > "PostgreSQL"
   - Railway will provide DATABASE_URL automatically

3. **Configure Environment Variables**
   ```env
   NEXTAUTH_URL=${{ RAILWAY_STATIC_URL }}
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Deploy**
   - Railway automatically deploys on git push
   - Run migrations using Railway CLI:
   ```bash
   railway login
   railway run npx prisma migrate deploy
   ```

## DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   name: career-linker
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/career-linker
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     routes:
     - path: /
   databases:
   - name: career-linker-db
     engine: PG
     version: "13"
   ```

3. **Environment Variables**
   Add in App Platform dashboard:
   ```env
   DATABASE_URL=${db.DATABASE_URL}
   NEXTAUTH_URL=${APP_URL}
   NEXTAUTH_SECRET="your-secret-key"
   ```

## AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify console
   - Connect your GitHub repository

2. **Build Settings**
   Create `amplify.yml`:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   Configure in Amplify console with your database and auth settings.

### Using EC2 with PM2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 22, 80, 443, 3000)

2. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/career-linker.git
   cd career-linker
   
   # Install dependencies
   npm ci
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "career-linker" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   Create `/etc/nginx/sites-available/career-linker`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables Reference

### Required Variables
```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="minimum-32-character-secret-key"
```

### Optional Variables
```env
# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (if implementing email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXX"

# File Upload
UPLOAD_MAX_SIZE="10485760" # 10MB in bytes
```

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] File upload directory accessible
- [ ] Error monitoring setup (Sentry, LogRocket)
- [ ] Analytics configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerts configured

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure database user has proper permissions

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Run `npx prisma generate` before building

3. **Authentication Issues**
   - Verify NEXTAUTH_URL matches deployment URL
   - Ensure NEXTAUTH_SECRET is properly set
   - Check OAuth provider configurations

4. **File Upload Issues**
   - Verify upload directory permissions
   - Check file size limits
   - Ensure proper disk space

### Performance Optimization

1. **Database Optimization**
   - Use connection pooling
   - Implement proper indexing
   - Monitor query performance

2. **Caching Strategy**
   - Use Redis for session storage
   - Implement API response caching
   - Use CDN for static assets

3. **Monitoring**
   - Set up application monitoring
   - Monitor database performance
   - Track error rates and response times
