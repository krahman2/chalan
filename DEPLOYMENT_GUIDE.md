# Production Deployment Guide

## 1. Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

```
VITE_SUPABASE_URL=https://dcgkrjltdekbfounxram.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZ2tyamx0ZGVrYmZvdW54cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDg4NjcsImV4cCI6MjA2ODI4NDg2N30.GmvoEU4pnZXS6BaH98kiEDIj3LN9ElxzGrS6eaxFQk4
```

## 2. Redeploy Your Application

1. Commit and push your latest changes:
```bash
git add .
git commit -m "Add database integration and time filters"
git push origin main
```

2. Vercel will automatically redeploy with the database connection

## 3. Test Production

1. Visit your deployed URL
2. Add a product and refresh - it should persist
3. Test the time filters with real data

## 4. Performance is Now Production-Ready!

✅ Data persists across sessions
✅ Real-time updates
✅ Professional database backend
✅ Scalable for hundreds of products/sales 