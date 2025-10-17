/**
 * Seed default subscription plans and domain pricing
 */

import { prisma } from '../src/lib/prisma';

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  // Basic Plan
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic' },
    create: {
      name: 'Basic',
      slug: 'basic',
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 4900, // €49/month in cents
      yearlyPrice: 49900, // €499/year in cents
      trialDays: 14,
      features: [
        'Profile Setup',
        'Reviews Management',
        '1 Featured Day/Month',
        'Basic Analytics',
        'Email Support',
      ],
      maxListings: 1,
      maxFeaturedDays: 30,
      isActive: true,
      displayOrder: 1,
    },
    update: {},
  });

  // Pro Plan
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses wanting more visibility',
      monthlyPrice: 9900, // €99/month in cents
      yearlyPrice: 99900, // €999/year in cents
      trialDays: 14,
      features: [
        'Everything in Basic',
        'AI Content Generator',
        'Video Gallery',
        '5 Featured Days/Month',
        'Advanced Analytics',
        'Priority Support',
        'Custom Domain (with plan)',
      ],
      maxListings: 3,
      maxFeaturedDays: 150,
      isActive: true,
      displayOrder: 2,
    },
    update: {},
  });

  // Premium Plan
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'premium' },
    create: {
      name: 'Premium',
      slug: 'premium',
      description: 'Maximum visibility and features for your business',
      monthlyPrice: 19900, // €199/month in cents
      yearlyPrice: 199900, // €1999/year in cents
      trialDays: 14,
      features: [
        'Everything in Pro',
        'Unlimited Featured Days',
        'Booking System',
        'E-commerce Integration',
        'API Access',
        '24/7 Dedicated Support',
        'Custom Branding',
        'Multiple Domains',
      ],
      maxListings: 10,
      maxFeaturedDays: 365,
      isActive: true,
      displayOrder: 3,
    },
    update: {},
  });

  console.log('✅ Subscription plans seeded');
}

async function seedDomainPricing() {
  console.log('🌱 Seeding domain pricing...');

  // Get the default domain (Haguenau)
  const domain = await prisma.domain.findUnique({
    where: { name: 'haguenau.pro' },
  });

  if (!domain) {
    console.log('⚠️ Default domain not found, skipping domain pricing seed');
    return;
  }

  await prisma.domainPricing.upsert({
    where: { domainId: domain.id },
    create: {
      domainId: domain.id,
      basicMonthly: 4900, // €49/month
      basicYearly: 49900, // €499/year
      proMonthly: 9900, // €99/month
      proYearly: 99900, // €999/year
      premiumMonthly: 19900, // €199/month
      premiumYearly: 199900, // €1999/year
      discountPercent: 20, // 20% discount for first year
      featuredBronze: 2999, // €29.99 for 7 days
      featuredSilver: 4999, // €49.99 for 14 days
      featuredGold: 7999, // €79.99 for 30 days
      featuredPlatinum: 14999, // €149.99 for 60 days
    },
    update: {},
  });

  console.log('✅ Domain pricing seeded');
}

async function main() {
  try {
    console.log('🚀 Starting subscription seed...');

    await seedSubscriptionPlans();
    await seedDomainPricing();

    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
