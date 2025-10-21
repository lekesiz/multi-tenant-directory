/**
 * n8n API Client
 *
 * Provides interface to n8n workflow automation platform
 * Used for AI orchestration and automation workflows
 */

import { logger } from '@/lib/logger';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: any;
}

export interface N8nWebhookResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export class N8nClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || process.env.N8N_API_URL || 'https://netzfrance.app.n8n.cloud';
    this.apiKey = apiKey || process.env.N8N_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('N8N_API_KEY not set. n8n features will be disabled.');
    }
  }

  /**
   * Check if n8n is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId: string, data?: any): Promise<N8nExecution> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call webhook (for AI orchestration)
   */
  async callWebhook(webhookPath: string, data: any): Promise<N8nWebhookResponse> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const response = await fetch(`${this.baseUrl}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch execution: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get recent executions for a workflow
   */
  async getExecutions(workflowId?: string, limit = 10): Promise<N8nExecution[]> {
    if (!this.isConfigured()) {
      throw new Error('n8n not configured');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(workflowId && { workflowId }),
    });

    const response = await fetch(`${this.baseUrl}/api/v1/executions?${params}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch executions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

// Singleton instance
let n8nClient: N8nClient | null = null;

/**
 * Get n8n client instance
 */
export function getN8nClient(): N8nClient {
  if (!n8nClient) {
    n8nClient = new N8nClient();
  }
  return n8nClient;
}

/**
 * Check if n8n is available
 */
export function isN8nAvailable(): boolean {
  return getN8nClient().isConfigured();
}
