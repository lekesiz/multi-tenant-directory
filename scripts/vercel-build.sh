#!/bin/bash

echo "🔨 Starting Vercel build..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Build Next.js
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

