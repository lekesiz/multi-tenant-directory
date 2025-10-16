/**
 * Advanced Marketing Automation Engine
 * Automated email campaigns, lead scoring, customer segmentation
 */

import { prisma } from './prisma';
import { sendEmail } from './emails';
import { nanoid } from 'nanoid';

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'push' | 'automation';
  status: 'draft' | 'active' | 'paused' | 'completed';
  triggers: CampaignTrigger[];
  actions: CampaignAction[];
  segment?: CustomerSegment;
  segmentId?: string;
  analytics: CampaignAnalytics;
}

export interface CampaignTrigger {
  type: 'time_based' | 'event_based' | 'behavior_based';
  condition: any;
  delay?: number; // milliseconds
}

export interface CampaignAction {
  type: 'send_email' | 'send_sms' | 'send_push' | 'update_score' | 'add_tag';
  template?: string;
  content?: any;
  delay?: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  rules: SegmentRule[];
  dynamicRefresh: boolean;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface LeadScore {
  userId: string;
  companyId: number;
  score: number;
  factors: ScoreFactor[];
  lastUpdated: Date;
}

export interface ScoreFactor {
  action: string;
  points: number;
  timestamp: Date;
  metadata?: any;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue?: number;
}

/**
 * Marketing Automation Engine
 */
export class MarketingAutomation {
  
  /**
   * Create a new marketing campaign
   */
  async createCampaign(
    businessOwnerId: string,
    campaignData: Partial<MarketingCampaign>
  ): Promise<MarketingCampaign> {
    const campaign = await prisma.marketingCampaign.create({
      data: {
        businessOwnerId,
        name: campaignData.name || 'Nouvelle campagne',
        type: campaignData.type || 'email',
        status: 'draft',
        triggers: campaignData.triggers || [],
        actions: campaignData.actions || [],
        segmentId: campaignData.segment?.id,
        analytics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          unsubscribed: 0,
          bounced: 0,
        },
      },
    });

    return this.formatCampaign(campaign);
  }

  /**
   * Customer Segmentation Engine
   */
  async createSegment(
    businessOwnerId: string,
    segmentData: Partial<CustomerSegment>
  ): Promise<CustomerSegment> {
    const segment = await prisma.customerSegment.create({
      data: {
        businessOwnerId,
        name: segmentData.name || 'Nouveau segment',
        rules: segmentData.rules || [],
        dynamicRefresh: segmentData.dynamicRefresh ?? true,
      },
    });

    // Calculate initial segment members
    await this.refreshSegmentMembers(segment.id);

    return this.formatSegment(segment);
  }

  /**
   * Execute segmentation rules to find matching customers
   */
  async refreshSegmentMembers(segmentId: string): Promise<string[]> {
    const segment = await prisma.customerSegment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) throw new Error('Segment not found');

    const rules = segment.rules as SegmentRule[];
    const query = this.buildSegmentQuery(rules);
    
    // Execute query to find matching business owners
    const matchingUsers = await this.executeSegmentQuery(query);
    
    // Update segment members
    await prisma.segmentMember.deleteMany({
      where: { segmentId },
    });

    if (matchingUsers.length > 0) {
      await prisma.segmentMember.createMany({
        data: matchingUsers.map(userId => ({
          segmentId,
          userId,
          addedAt: new Date(),
        })),
      });
    }

    return matchingUsers;
  }

  /**
   * Lead Scoring System
   */
  async updateLeadScore(
    userId: string,
    companyId: number,
    action: string,
    points: number,
    metadata?: any
  ): Promise<LeadScore> {
    // Get or create lead score record
    let leadScore = await prisma.leadScore.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
    });

    if (!leadScore) {
      leadScore = await prisma.leadScore.create({
        data: {
          userId,
          companyId,
          score: 0,
          factors: [],
        },
      });
    }

    // Add new scoring factor
    const factors = leadScore.factors as ScoreFactor[];
    factors.push({
      action,
      points,
      timestamp: new Date(),
      metadata,
    });

    // Calculate new total score
    const newScore = factors.reduce((total, factor) => total + factor.points, 0);

    // Update record
    const updatedLeadScore = await prisma.leadScore.update({
      where: { id: leadScore.id },
      data: {
        score: newScore,
        factors,
        lastUpdated: new Date(),
      },
    });

    // Check for automation triggers based on score
    await this.checkScoreBasedTriggers(userId, companyId, newScore);

    return {
      userId: updatedLeadScore.userId,
      companyId: updatedLeadScore.companyId,
      score: updatedLeadScore.score,
      factors: updatedLeadScore.factors as ScoreFactor[],
      lastUpdated: updatedLeadScore.lastUpdated,
    };
  }

  /**
   * Automated Email Campaigns
   */
  async sendAutomatedEmail(
    campaignId: string,
    userId: string,
    templateOverride?: any
  ): Promise<boolean> {
    try {
      const campaign = await prisma.marketingCampaign.findUnique({
        where: { id: campaignId },
        include: {
          businessOwner: true,
        },
      });

      if (!campaign) throw new Error('Campaign not found');

      const user = await prisma.businessOwner.findUnique({
        where: { id: userId },
      });

      if (!user || !user.emailNotifications) {
        // User not found or email notifications disabled - skip silently
        return false;
      }

      // Get email template
      const emailAction = (campaign.actions as CampaignAction[]).find(
        action => action.type === 'send_email'
      );

      if (!emailAction) {
        // No email action configured in campaign
        return false;
      }

      // Personalize email content
      const personalizedContent = await this.personalizeEmailContent(
        emailAction.content || templateOverride,
        user,
        campaign
      );

      // Send email
      await sendEmail({
        to: user.email,
        subject: personalizedContent.subject,
        html: personalizedContent.html,
        from: campaign.businessOwner.email,
      });

      // Track campaign metrics
      await this.trackCampaignEvent(campaignId, userId, 'sent');

      return true;
    } catch (error) {
      console.error('Error sending automated email:', error);
      return false;
    }
  }

  /**
   * Event-Based Automation Triggers
   */
  async processEventTrigger(
    event: string,
    userId: string,
    companyId: number,
    metadata?: any
  ): Promise<void> {
    // Find campaigns with matching event triggers
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        status: 'active',
        triggers: {
          path: '$[*].type',
          equals: 'event_based',
        },
      },
    });

    for (const campaign of campaigns) {
      const triggers = campaign.triggers as CampaignTrigger[];
      const matchingTrigger = triggers.find(
        trigger => 
          trigger.type === 'event_based' && 
          trigger.condition.event === event
      );

      if (matchingTrigger) {
        // Check if user is in campaign segment (if any)
        if (campaign.segmentId) {
          const isInSegment = await this.isUserInSegment(userId, campaign.segmentId);
          if (!isInSegment) continue;
        }

        // Execute campaign actions with delay
        await this.executeCampaignActions(
          campaign.id,
          userId,
          matchingTrigger.delay || 0
        );
      }
    }
  }

  /**
   * Time-Based Campaign Execution
   */
  async processScheduledCampaigns(): Promise<void> {
    const now = new Date();
    
    // Find campaigns scheduled to run
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        status: 'active',
        nextRunAt: {
          lte: now,
        },
      },
    });

    for (const campaign of campaigns) {
      await this.executeCampaign(campaign.id);
    }
  }

  /**
   * A/B Testing Framework
   */
  async createABTest(
    campaignId: string,
    variants: {
      name: string;
      weight: number; // percentage 0-100
      content: any;
    }[]
  ): Promise<string> {
    const abTest = await prisma.abTest.create({
      data: {
        campaignId,
        variants,
        status: 'active',
        results: {},
      },
    });

    return abTest.id;
  }

  /**
   * Customer Journey Tracking
   */
  async trackCustomerJourney(
    userId: string,
    companyId: number,
    touchpoint: string,
    metadata?: any
  ): Promise<void> {
    await prisma.customerJourney.create({
      data: {
        userId,
        companyId,
        touchpoint,
        timestamp: new Date(),
        metadata: metadata || {},
      },
    });

    // Update lead score based on touchpoint
    const scoreMapping: Record<string, number> = {
      'website_visit': 1,
      'email_open': 2,
      'email_click': 5,
      'form_submit': 10,
      'demo_request': 25,
      'trial_signup': 50,
      'purchase': 100,
    };

    const points = scoreMapping[touchpoint] || 0;
    if (points > 0) {
      await this.updateLeadScore(userId, companyId, touchpoint, points, metadata);
    }
  }

  // Helper methods
  private async buildSegmentQuery(rules: SegmentRule[]): Promise<any> {
    // Build Prisma query from segment rules
    const query: any = { where: {} };
    
    for (const rule of rules) {
      const condition = this.buildRuleCondition(rule);
      if (rule.logicalOperator === 'OR') {
        query.where.OR = query.where.OR || [];
        query.where.OR.push(condition);
      } else {
        Object.assign(query.where, condition);
      }
    }
    
    return query;
  }

  private buildRuleCondition(rule: SegmentRule): any {
    const { field, operator, value } = rule;
    
    switch (operator) {
      case 'equals':
        return { [field]: value };
      case 'not_equals':
        return { [field]: { not: value } };
      case 'contains':
        return { [field]: { contains: value } };
      case 'greater_than':
        return { [field]: { gt: value } };
      case 'less_than':
        return { [field]: { lt: value } };
      case 'in':
        return { [field]: { in: value } };
      case 'not_in':
        return { [field]: { notIn: value } };
      default:
        return {};
    }
  }

  private async executeSegmentQuery(query: any): Promise<string[]> {
    const users = await prisma.businessOwner.findMany({
      ...query,
      select: { id: true },
    });
    
    return users.map(user => user.id);
  }

  private async checkScoreBasedTriggers(
    userId: string,
    companyId: number,
    score: number
  ): Promise<void> {
    // Find campaigns with score-based triggers
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        status: 'active',
        triggers: {
          path: '$[*].type',
          equals: 'behavior_based',
        },
      },
    });

    for (const campaign of campaigns) {
      const triggers = campaign.triggers as CampaignTrigger[];
      const scoreTrigger = triggers.find(
        trigger => 
          trigger.type === 'behavior_based' && 
          trigger.condition.score_threshold <= score
      );

      if (scoreTrigger) {
        await this.executeCampaignActions(campaign.id, userId, 0);
      }
    }
  }

  private async personalizeEmailContent(
    template: any,
    user: any,
    campaign: any
  ): Promise<{ subject: string; html: string }> {
    // Simple template personalization
    const variables = {
      firstName: user.firstName || 'Cher(e) client(e)',
      lastName: user.lastName || '',
      email: user.email,
      companyName: campaign.businessOwner.firstName || 'Notre entreprise',
    };

    let subject = template.subject || 'Nouveau message';
    let html = template.html || template.content || 'Contenu du message';

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    }

    return { subject, html };
  }

  private async isUserInSegment(userId: string, segmentId: string): Promise<boolean> {
    const member = await prisma.segmentMember.findUnique({
      where: {
        segmentId_userId: { segmentId, userId },
      },
    });
    
    return !!member;
  }

  private async executeCampaignActions(
    campaignId: string,
    userId: string,
    delay: number = 0
  ): Promise<void> {
    if (delay > 0) {
      // Schedule for later execution
      setTimeout(() => {
        this.executeCampaignActions(campaignId, userId, 0);
      }, delay);
      return;
    }

    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    const actions = campaign.actions as CampaignAction[];
    
    for (const action of actions) {
      switch (action.type) {
        case 'send_email':
          await this.sendAutomatedEmail(campaignId, userId);
          break;
        case 'update_score':
          // Implementation for score updates
          break;
        case 'add_tag':
          // Implementation for tagging
          break;
      }
    }
  }

  private async executeCampaign(campaignId: string): Promise<void> {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    // Get segment members or all users
    let targetUsers: string[] = [];
    
    if (campaign.segmentId) {
      const members = await prisma.segmentMember.findMany({
        where: { segmentId: campaign.segmentId },
        select: { userId: true },
      });
      targetUsers = members.map(m => m.userId);
    } else {
      // All active users
      const users = await prisma.businessOwner.findMany({
        where: { subscriptionStatus: 'active' },
        select: { id: true },
      });
      targetUsers = users.map(u => u.id);
    }

    // Execute campaign for each user
    for (const userId of targetUsers) {
      await this.executeCampaignActions(campaignId, userId);
    }

    // Update next run time for recurring campaigns
    const triggers = campaign.triggers as CampaignTrigger[];
    const timeTrigger = triggers.find(t => t.type === 'time_based');
    
    if (timeTrigger && timeTrigger.condition.recurring) {
      const nextRun = new Date();
      nextRun.setTime(nextRun.getTime() + timeTrigger.condition.interval);
      
      await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: { nextRunAt: nextRun },
      });
    }
  }

  private async trackCampaignEvent(
    campaignId: string,
    userId: string,
    event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted'
  ): Promise<void> {
    // Track individual event
    await prisma.campaignEvent.create({
      data: {
        campaignId,
        userId,
        event,
        timestamp: new Date(),
      },
    });

    // Update campaign analytics
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (campaign) {
      const analytics = campaign.analytics as CampaignAnalytics;
      analytics[event] = (analytics[event] || 0) + 1;
      
      await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: { analytics },
      });
    }
  }

  private formatCampaign(campaign: any): MarketingCampaign {
    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      triggers: campaign.triggers,
      actions: campaign.actions,
      analytics: campaign.analytics,
    };
  }

  private formatSegment(segment: any): CustomerSegment {
    return {
      id: segment.id,
      name: segment.name,
      rules: segment.rules,
      dynamicRefresh: segment.dynamicRefresh,
    };
  }
}

// Export singleton instance
export const marketingAutomation = new MarketingAutomation();