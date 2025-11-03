import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createReferralCode } from '@/lib/referral';

export async function POST(request: Request) {
  try {
    const { businessOwnerId, businessName, rewardType = 'STANDARD' } = await request.json();

    if (!businessOwnerId || !businessName) {
      return NextResponse.json(
        { error: 'Données manquantes (businessOwnerId, businessName requis)' },
        { status: 400 }
      );
    }

    // Create new referral code
    const referralCode = await createReferralCode(
      businessOwnerId,
      businessName,
      rewardType
    );

    return NextResponse.json({
      success: true,
      referral: referralCode,
      message: 'Code de parrainage créé avec succès'
    });

  } catch (error) {
    logger.error('Create referral API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du code de parrainage' },
      { status: 500 }
    );
  }
}