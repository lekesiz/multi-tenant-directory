import { NextRequest, NextResponse } from 'next/server';
import { syncCompanyReviews, syncAllCompaniesReviews } from '@/lib/google-places';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, syncAll } = body;

    if (syncAll) {
      // Sync all companies
      const result = await syncAllCompaniesReviews();
      return NextResponse.json(result);
    } else if (companyId) {
      // Sync specific company
      const result = await syncCompanyReviews(companyId);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: 'Missing companyId or syncAll parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in sync reviews API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

