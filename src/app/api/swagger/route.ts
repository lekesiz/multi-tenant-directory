/**
 * Swagger JSON Endpoint
 * 
 * Serves the OpenAPI specification as JSON
 */

import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

export async function GET() {
  return NextResponse.json(swaggerSpec);
}

