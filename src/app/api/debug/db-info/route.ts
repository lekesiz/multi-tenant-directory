import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Masquer le mot de passe
  const masked = dbUrl.replace(/:[^@]+@/, ':****@');
  
  return NextResponse.json({
    databaseUrl: masked,
    hasUrl: !!process.env.DATABASE_URL,
    urlLength: dbUrl.length,
    // Extraire les parties importantes
    host: dbUrl.match(/@([^/]+)/)?.[1] || 'N/A',
    database: dbUrl.match(/\/([^?]+)/)?.[1] || 'N/A',
  });
}
