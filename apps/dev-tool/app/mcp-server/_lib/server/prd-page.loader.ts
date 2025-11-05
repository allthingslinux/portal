import 'server-only';

import { relative } from 'node:path';

import { PRDManager } from '@portal/mcp-server/prd-manager';

export interface CustomPhase {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  userStoryIds: string[];
}

export interface PRDData {
  introduction: {
    title: string;
    overview: string;
    lastUpdated: string;
  };
  problemStatement: {
    problem: string;
    marketOpportunity: string;
    targetUsers: string[];
  };
  solutionOverview: {
    description: string;
    keyFeatures: string[];
    successMetrics: string[];
  };
  userStories: Array<{
    id: string;
    title: string;
    userStory: string;
    businessValue: string;
    acceptanceCriteria: string[];
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    status:
      | 'not_started'
      | 'research'
      | 'in_progress'
      | 'review'
      | 'completed'
      | 'blocked';
    notes?: string;
    estimatedComplexity?: string;
    dependencies?: string[];
    completedAt?: string;
  }>;
  customPhases?: CustomPhase[];
  metadata: {
    version: string;
    created: string;
    lastUpdated: string;
    approver: string;
  };
  progress: {
    overall: number;
    completed: number;
    total: number;
    blocked: number;
  };
}

export async function loadPRDPageData(filename: string): Promise<PRDData> {
  try {
    PRDManager.setRootPath(relative(process.cwd(), '../..'));

    const content = await PRDManager.getPRDContent(filename);

    return JSON.parse(content) as PRDData;
  } catch (error) {
    console.error(`Failed to load PRD ${filename}:`, error);

    throw new Error(`PRD not found: ${filename}`);
  }
}
