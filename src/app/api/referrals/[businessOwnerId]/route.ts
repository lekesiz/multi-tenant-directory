import { NextResponse } from 'next/server';
import { getReferralStats } from '@/lib/referral';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ businessOwnerId: string }> }
) {
  try {
    const { businessOwnerId } = await params;

    if (!businessOwnerId) {
      return NextResponse.json(
        { error: 'ID du propriétaire d\'entreprise manquant' },
        { status: 400 }
      );
    }

    // Get referral statistics for the business owner
    const stats = await getReferralStats(businessOwnerId);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Get referral stats API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques de parrainage' },
      { status: 500 }
    );
  }
}