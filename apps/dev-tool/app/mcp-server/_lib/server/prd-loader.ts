import { relative } from 'node:path';

import { PRDManager } from '@portal/mcp-server/prd-manager';

interface PRDSummary {
  filename: string;
  title: string;
  lastUpdated: string;
  progress: number;
  totalStories: number;
  completedStories: number;
}

export async function loadPRDs(): Promise<PRDSummary[]> {
  try {
    PRDManager.setRootPath(relative(process.cwd(), '../..'));

    // Use the actual PRDManager to list PRDs
    const prdFiles = await PRDManager.listPRDs();

    const prdSummaries: PRDSummary[] = [];

    // Load each PRD to get its details
    for (const filename of prdFiles) {
      try {
        const content = await PRDManager.getPRDContent(filename);
        const prd = JSON.parse(content);

        prdSummaries.push({
          filename,
          title: prd.introduction.title,
          lastUpdated: prd.metadata.lastUpdated,
          progress: prd.progress.overall,
          totalStories: prd.progress.total,
          completedStories: prd.progress.completed,
        });
      } catch (prdError) {
        console.error(`Failed to load PRD ${filename}:`, prdError);
        // Continue with other PRDs even if one fails
      }
    }

    return prdSummaries;
  } catch (error) {
    console.error('Failed to load PRDs:', error);
    return [];
  }
}
