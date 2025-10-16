import { NextResponse } from 'next/server';
import { validateReferralCode, trackReferralClick } from '@/lib/referral';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code de parrainage requis' },
        { status: 400 }
      );
    }

    // Validate referral code
    const validation = await validateReferralCode(code);

    if (!validation.valid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: validation.error 
        },
        { status: 400 }
      );
    }

    // Track the click
    await trackReferralClick(code);

    return NextResponse.json({
      valid: true,
      referral: {
        code,
        referrerName: `${validation.referral.referrer.firstName} ${validation.referral.referrer.lastName}`,
        referrerEmail: validation.referral.referrer.email,
        rewards: {
          referrerReward: validation.referral.referrerReward,
          referredReward: validation.referral.referredReward,
        },
      },
      message: 'Code de parrainage valide'
    });

  } catch (error) {
    console.error('Validate referral API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la validation du code de parrainage' },
      { status: 500 }
    );
  }
}