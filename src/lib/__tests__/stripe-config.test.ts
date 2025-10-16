/**
 * Stripe Configuration Unit Tests
 * Tests for subscription plans, pricing, and utilities
 */

import { SUBSCRIPTION_PLANS, ANNUAL_PLANS, getPlansWithPricing, getPlanById, canUpgrade, canDowngrade } from '../stripe-config';

describe('Stripe Configuration', () => {
  
  describe('Subscription Plans', () => {
    test('should have all required plans', () => {
      expect(SUBSCRIPTION_PLANS).toHaveProperty('free');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('basic');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('pro');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('enterprise');
    });

    test('should have valid plan structure', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
        expect(plan.features).toHaveProperty('companies');
        expect(plan.features).toHaveProperty('reviews');
        expect(plan.features).toHaveProperty('photos');
      });
    });

    test('should have correct pricing hierarchy', () => {
      const plans = Object.values(SUBSCRIPTION_PLANS);
      const prices = plans.map(p => p.price).filter(p => p !== null);
      
      // Should be in ascending order (except for free and enterprise)
      expect(SUBSCRIPTION_PLANS.free.price).toBe(0);
      expect(SUBSCRIPTION_PLANS.basic.price).toBeLessThan(SUBSCRIPTION_PLANS.pro.price!);
      // Enterprise is custom pricing (null)
      expect(SUBSCRIPTION_PLANS.enterprise.price).toBeNull();
    });
  });

  describe('Annual Plans', () => {
    test('should have annual discounts', () => {
      Object.entries(ANNUAL_PLANS).forEach(([key, annualPlan]) => {
        if (key !== 'free' && key !== 'enterprise') {
          const monthlyPlan = SUBSCRIPTION_PLANS[key as keyof typeof SUBSCRIPTION_PLANS];
          if (monthlyPlan.price && annualPlan.price) {
            const monthlyTotal = monthlyPlan.price * 12;
            expect(annualPlan.price).toBeLessThan(monthlyTotal);
            
            // Should be 20% discount
            const expectedAnnual = monthlyTotal * 0.8;
            expect(Math.abs(annualPlan.price - expectedAnnual)).toBeLessThan(0.01);
          }
        }
      });
    });
  });

  describe('Plan Utilities', () => {
    test('should get plans with pricing correctly', () => {
      const plans = getPlansWithPricing();
      
      expect(plans).toHaveLength(4);
      plans.forEach(plan => {
        expect(plan).toHaveProperty('key');
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
      });
    });

    test('should get plan by ID', () => {
      const basicPlan = getPlanById('basic');
      expect(basicPlan).toBeDefined();
      expect(basicPlan?.id).toBe('basic');
      expect(basicPlan?.name).toBe('Basique');

      const invalidPlan = getPlanById('invalid');
      expect(invalidPlan).toBeUndefined();
    });

    test('should check upgrade eligibility', () => {
      expect(canUpgrade('free', 'basic')).toBe(true);
      expect(canUpgrade('basic', 'pro')).toBe(true);
      expect(canUpgrade('pro', 'enterprise')).toBe(true);
      
      // Cannot upgrade to same or lower tier
      expect(canUpgrade('basic', 'free')).toBe(false);
      expect(canUpgrade('pro', 'basic')).toBe(false);
      expect(canUpgrade('basic', 'basic')).toBe(false);
    });

    test('should check downgrade eligibility', () => {
      expect(canDowngrade('basic', 'free')).toBe(true);
      expect(canDowngrade('pro', 'basic')).toBe(true);
      expect(canDowngrade('enterprise', 'pro')).toBe(true);
      
      // Cannot downgrade to same or higher tier
      expect(canDowngrade('free', 'basic')).toBe(false);
      expect(canDowngrade('basic', 'pro')).toBe(false);
      expect(canDowngrade('basic', 'basic')).toBe(false);
    });
  });

  describe('Feature Limits', () => {
    test('should have unlimited features for higher tiers', () => {
      const proPlan = SUBSCRIPTION_PLANS.pro;
      const enterprisePlan = SUBSCRIPTION_PLANS.enterprise;
      
      expect(proPlan.features.companies).toBe(-1); // unlimited
      expect(proPlan.features.reviews).toBe(-1);
      expect(proPlan.features.photos).toBe(-1);
      
      expect(enterprisePlan.features.companies).toBe(-1);
      expect(enterprisePlan.features.reviews).toBe(-1);
      expect(enterprisePlan.features.photos).toBe(-1);
    });

    test('should have limited features for lower tiers', () => {
      const freePlan = SUBSCRIPTION_PLANS.free;
      const basicPlan = SUBSCRIPTION_PLANS.basic;
      
      expect(freePlan.features.companies).toBeGreaterThan(0);
      expect(freePlan.features.companies).toBeLessThan(10);
      
      expect(basicPlan.features.companies).toBeGreaterThan(freePlan.features.companies);
    });
  });

  describe('Stripe Integration', () => {
    test('should have Stripe price IDs for paid plans', () => {
      expect(SUBSCRIPTION_PLANS.basic.stripePriceId).toBeTruthy();
      expect(SUBSCRIPTION_PLANS.pro.stripePriceId).toBeTruthy();
      
      // Free and enterprise don't need Stripe price IDs
      expect(SUBSCRIPTION_PLANS.free.stripePriceId).toBeNull();
      expect(SUBSCRIPTION_PLANS.enterprise.stripePriceId).toBeNull();
    });

    test('should have annual Stripe price IDs', () => {
      expect(ANNUAL_PLANS.basic.stripePriceId).toBeTruthy();
      expect(ANNUAL_PLANS.pro.stripePriceId).toBeTruthy();
    });
  });

  describe('Plan Features', () => {
    test('should include required features', () => {
      Object.values(SUBSCRIPTION_PLANS).forEach(plan => {
        expect(plan.features).toHaveProperty('analytics');
        expect(plan.features).toHaveProperty('ai_features');
        expect(plan.features).toHaveProperty('marketing_automation');
        expect(plan.features).toHaveProperty('priority_support');
        
        if (plan.id === 'enterprise') {
          expect(plan.features.white_label).toBe(true);
        }
      });
    });

    test('should have progressive feature enablement', () => {
      const plans = ['free', 'basic', 'pro', 'enterprise'] as const;
      
      // AI features should be enabled from pro tier
      expect(SUBSCRIPTION_PLANS.free.features.ai_features).toBe(false);
      expect(SUBSCRIPTION_PLANS.basic.features.ai_features).toBe(false);
      expect(SUBSCRIPTION_PLANS.pro.features.ai_features).toBe(true);
      expect(SUBSCRIPTION_PLANS.enterprise.features.ai_features).toBe(true);
      
      // Marketing automation from pro tier
      expect(SUBSCRIPTION_PLANS.pro.features.marketing_automation).toBe(true);
      expect(SUBSCRIPTION_PLANS.enterprise.features.marketing_automation).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should handle invalid plan IDs gracefully', () => {
      expect(() => getPlanById('invalid')).not.toThrow();
      expect(() => canUpgrade('invalid', 'basic')).not.toThrow();
      expect(() => canDowngrade('basic', 'invalid')).not.toThrow();
    });

    test('should handle null/undefined inputs', () => {
      expect(getPlanById('')).toBeUndefined();
      expect(canUpgrade('', 'basic')).toBe(false);
      expect(canDowngrade('basic', '')).toBe(false);
    });
  });
});