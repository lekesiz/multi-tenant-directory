#!/bin/bash

# Lead Management System Migration Script
# This script runs the migration on Vercel production database

echo "🚀 Starting Lead Management System Migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in Vercel Environment Variables"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Run the migration
echo "📦 Running migration: add_lead_management_system"
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "📊 Lead management tables created:"
    echo "   - leads"
    echo "   - lead_assignments" 
    echo "   - consent_logs"
    echo "   - company_scores"
    echo "   - certificates"
    echo "   - communication_logs"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🎉 Lead Management System is ready!"
