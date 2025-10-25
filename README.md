# Backend API - Vercel Deployment Guide

This backend API is configured for seamless deployment on Vercel.

## Deployment Instructions

### Prerequisites

- A [Vercel](https://vercel.com) account
- [Vercel CLI](https://vercel.com/cli) installed (optional for local testing)
- A PostgreSQL database (can use Vercel Postgres, Supabase, or any other provider)

### Steps to Deploy

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect your repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your repository
   - Select "Node.js" as the framework preset

3. **Configure environment variables**:
   - In the Vercel project settings, add the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: Set to `production`
     - `MAIL_PORT`, `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`: Email service credentials
     - Any other environment variables your application needs

4. **Deploy**:
   - Click "Deploy" and Vercel will automatically build and deploy your application
   - The build process will run `vercel-build` script which generates Prisma client and compiles TypeScript

### Local Testing Before Deployment

To test your application locally before deploying:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Build the application
npm run build

# Start the application
npm start
```

### Continuous Deployment

Vercel automatically deploys when you push changes to your repository. The deployment process:

1. Installs dependencies
2. Runs the `vercel-build` script (generates Prisma client and compiles TypeScript)
3. Deploys the application

## Project Structure

- `src/` - Source code
- `prisma/` - Prisma schema and migrations
- `vercel.json` - Vercel configuration
- `.env.production` - Production environment variables
- `.vercelignore` - Files to exclude from deployment

## Database Migrations

For database migrations on Vercel:

1. Run migrations locally first: `npm run db:migrate`
2. Deploy your application to Vercel
3. Connect to your production database and apply migrations: `npm run db:deploy`

## Troubleshooting

- **Cold Starts**: Serverless functions may experience cold starts. Consider using Vercel's Edge Functions for improved performance.
- **Connection Limits**: Be mindful of database connection limits in serverless environments.
- **Logs**: Check Vercel deployment logs for troubleshooting.