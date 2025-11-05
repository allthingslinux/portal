import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

interface ScriptInfo {
  name: string;
  command: string;
  category:
    | 'development'
    | 'build'
    | 'testing'
    | 'linting'
    | 'database'
    | 'maintenance'
    | 'environment';
  description: string;
  usage: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  healthcheck?: boolean;
}

export class ScriptsTool {
  static async getScripts(): Promise<ScriptInfo[]> {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    const scripts: ScriptInfo[] = [];

    for (const [scriptName, command] of Object.entries(packageJson.scripts)) {
      if (typeof command === 'string') {
        const scriptInfo = this.getScriptInfo(scriptName, command);
        scripts.push(scriptInfo);
      }
    }

    return scripts.sort((a, b) => {
      const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
  }

  static async getScriptDetails(scriptName: string): Promise<ScriptInfo> {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    const command = packageJson.scripts[scriptName];
    if (!command) {
      throw new Error(`Script "${scriptName}" not found`);
    }

    return this.getScriptInfo(scriptName, command);
  }

  private static getScriptInfo(
    scriptName: string,
    command: string,
  ): ScriptInfo {
    const scriptDescriptions: Record<
      string,
      Omit<ScriptInfo, 'name' | 'command'>
    > = {
      dev: {
        category: 'development',
        description:
          'Start development servers for all applications in parallel with hot reloading',
        usage: 'Run this to start developing. Opens web app on port 3000.',
        importance: 'medium',
      },
      build: {
        category: 'build',
        description:
          'Build all applications and packages for production deployment',
        usage:
          'Use before deploying to production. Ensures all code compiles correctly.',
        importance: 'medium',
      },
      typecheck: {
        category: 'linting',
        description:
          'Run TypeScript compiler to check for type errors across all packages',
        usage:
          'CRITICAL: Run after writing code to ensure type safety. Must pass before commits.',
        importance: 'critical',
        healthcheck: true,
      },
      lint: {
        category: 'linting',
        description:
          'Run ESLint to check code quality and enforce coding standards',
        usage:
          'CRITICAL: Run after writing code to ensure code quality. Must pass before commits.',
        importance: 'medium',
        healthcheck: true,
      },
      'lint:fix': {
        category: 'linting',
        description:
          'Run ESLint with auto-fix to automatically resolve fixable issues',
        usage:
          'Use to automatically fix linting issues. Run before manual fixes.',
        importance: 'high',
        healthcheck: true,
      },
      format: {
        category: 'linting',
        description: 'Check code formatting with Prettier across all files',
        usage: 'Verify code follows consistent formatting standards.',
        importance: 'high',
      },
      'format:fix': {
        category: 'linting',
        description:
          'Auto-format all code with Prettier to ensure consistent styling',
        usage: 'Use to automatically format code. Run before commits.',
        importance: 'high',
        healthcheck: true,
      },
      test: {
        category: 'testing',
        description: 'Run all test suites across the monorepo',
        usage: 'Execute to verify functionality. Should pass before commits.',
        importance: 'high',
        healthcheck: true,
      },
      'supabase:web:start': {
        category: 'database',
        description: 'Start local Supabase instance for development',
        usage: 'Required for local development with database access.',
        importance: 'critical',
      },
      'supabase:web:stop': {
        category: 'database',
        description: 'Stop the local Supabase instance',
        usage: 'Use when done developing to free up resources.',
        importance: 'medium',
      },
      'supabase:web:reset': {
        category: 'database',
        description: 'Reset local database to latest schema and seed data',
        usage: 'Use when database state is corrupted or needs fresh start.',
        importance: 'high',
      },
      'supabase:web:typegen': {
        category: 'database',
        description: 'Generate TypeScript types from Supabase database schema',
        usage: 'Run after database schema changes to update types.',
        importance: 'high',
      },
      'supabase:web:test': {
        category: 'testing',
        description: 'Run Supabase-specific tests',
        usage: 'Test database functions, RLS policies, and migrations.',
        importance: 'high',
      },
      clean: {
        category: 'maintenance',
        description: 'Remove all generated files and dependencies',
        usage:
          'Use when build artifacts are corrupted. Requires reinstall after.',
        importance: 'medium',
      },
      'clean:workspaces': {
        category: 'maintenance',
        description: 'Clean all workspace packages using Turbo',
        usage: 'Lighter cleanup that preserves node_modules.',
        importance: 'medium',
      },
      'env:generate': {
        category: 'environment',
        description: 'Generate environment variable templates',
        usage: 'Creates .env templates for new environments.',
        importance: 'low',
      },
      'env:validate': {
        category: 'environment',
        description: 'Validate environment variables against schema',
        usage: 'Ensures all required environment variables are properly set.',
        importance: 'medium',
      },
      update: {
        category: 'maintenance',
        description: 'Update all dependencies across the monorepo',
        usage: 'Keep dependencies current. Test thoroughly after updating.',
        importance: 'low',
      },
      'syncpack:list': {
        category: 'maintenance',
        description: 'List dependency version mismatches across packages',
        usage: 'Identify inconsistent package versions in monorepo.',
        importance: 'low',
      },
      'syncpack:fix': {
        category: 'maintenance',
        description: 'Fix dependency version mismatches across packages',
        usage: 'Automatically align package versions across workspaces.',
        importance: 'low',
      },
      'supabase:cli': {
        category: 'database',
        description: 'Access Supabase CLI commands via web project',
        usage:
          'Use with: pnpm --filter web supabase <command>. Examples: db diff, db push, gen types, etc.',
        importance: 'high',
      },
    };

    const scriptInfo = scriptDescriptions[scriptName] || {
      category: 'maintenance' as const,
      description: `Custom script: ${scriptName}`,
      usage: 'See package.json for command details.',
      importance: 'low' as const,
    };

    return {
      name: scriptName,
      command,
      ...scriptInfo,
    };
  }

  static getHealthcheckScripts(): ScriptInfo[] {
    const allScripts = ['typecheck', 'lint', 'lint:fix', 'format:fix', 'test'];

    return allScripts.map((scriptName) =>
      this.getScriptInfo(scriptName, `[healthcheck] ${scriptName}`),
    );
  }
}

export function registerScriptsTools(server: McpServer) {
  createGetScriptsTool(server);
  createGetScriptDetailsTool(server);
  createGetHealthcheckScriptsTool(server);
}

function createGetScriptsTool(server: McpServer) {
  return server.tool(
    'get_scripts',
    'Get all available npm/pnpm scripts with descriptions and usage guidance',
    async () => {
      const scripts = await ScriptsTool.getScripts();

      const scriptsList = scripts
        .map((script) => {
          const healthcheck = script.healthcheck ? ' [HEALTHCHECK]' : '';
          return `${script.name} (${script.category})${healthcheck}: ${script.description}\n  Usage: ${script.usage}`;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Available Scripts (sorted by importance):\n\n${scriptsList}`,
          },
        ],
      };
    },
  );
}

function createGetScriptDetailsTool(server: McpServer) {
  return server.tool(
    'get_script_details',
    'Get detailed information about a specific script',
    {
      state: z.object({
        scriptName: z.string(),
      }),
    },
    async ({ state }) => {
      const script = await ScriptsTool.getScriptDetails(state.scriptName);

      const healthcheck = script.healthcheck
        ? '\n�  HEALTHCHECK SCRIPT: This script should be run after writing code to ensure quality.'
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `Script: ${script.name}
Command: ${script.command}
Category: ${script.category}
Importance: ${script.importance}
Description: ${script.description}
Usage: ${script.usage}${healthcheck}`,
          },
        ],
      };
    },
  );
}

function createGetHealthcheckScriptsTool(server: McpServer) {
  return server.tool(
    'get_healthcheck_scripts',
    'Get critical scripts that should be run after writing code (typecheck, lint, format, test)',
    async () => {
      const scripts = await ScriptsTool.getScripts();
      const healthcheckScripts = scripts.filter((script) => script.healthcheck);

      const scriptsList = healthcheckScripts
        .map((script) => `pnpm ${script.name}: ${script.usage}`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `<� CODE HEALTHCHECK SCRIPTS

These scripts MUST be run after writing code to ensure quality:

${scriptsList}

�  IMPORTANT: Always run these scripts before considering your work complete. They catch type errors, code quality issues, and ensure consistent formatting.`,
          },
        ],
      };
    },
  );
}
