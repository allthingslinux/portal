import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

interface PromptTemplate {
  name: string;
  title: string;
  description: string;
  category:
    | 'code-review'
    | 'development'
    | 'database'
    | 'testing'
    | 'architecture'
    | 'debugging';
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
    type: 'string' | 'text' | 'enum';
    options?: string[];
  }>;
  template: string;
  examples?: string[];
}

export class PromptsManager {
  private static prompts: PromptTemplate[] = [
    {
      name: 'code_review',
      title: 'Comprehensive Code Review',
      description:
        'Analyze code for quality, security, performance, and best practices',
      category: 'code-review',
      arguments: [
        {
          name: 'code',
          description: 'The code to review',
          required: true,
          type: 'text',
        },
        {
          name: 'focus_area',
          description: 'Specific area to focus the review on',
          required: false,
          type: 'enum',
          options: [
            'security',
            'performance',
            'maintainability',
            'typescript',
            'react',
            'all',
          ],
        },
        {
          name: 'severity_level',
          description: 'Minimum severity level for issues to report',
          required: false,
          type: 'enum',
          options: ['low', 'medium', 'high', 'critical'],
        },
      ],
      template: `Please review the following code with a focus on {{focus_area || 'all aspects'}}.

**Code to Review:**
\`\`\`
{{code}}
\`\`\`

**Makerkit Standards Review Criteria:**

**TypeScript Excellence:**
- Strict TypeScript with no 'any' types - use explicit types always
- Implicit type inference preferred unless impossible
- Proper error handling with try/catch and typed error objects
- Clean, clear, well-designed code without obvious comments

**React & Next.js 15 Best Practices:**
- Functional components only with 'use client' directive for client components
- Encapsulate repeated blocks of code into reusable local components
- Avoid useEffect (code smell) - justify if absolutely necessary
- Single state objects over multiple useState calls
- Prefer server-side data fetching using React Server Components
- Display loading indicators with LoadingSpinner component where appropriate
- Add data-test attributes for E2E testing where appropriate
- Server actions that redirect should handle the error using "isRedirectError" from 'next/dist/client/components/redirect-error'

**Makerkit Architecture Patterns:**
- Multi-tenant architecture with proper account-based access control
- Use account_id foreign keys for data association
- Personal vs Team accounts pattern implementation
- Proper use of Row Level Security (RLS) policies
- Supabase integration best practices

**Database Best Practices:**
- Use existing database functions instead of writing your own
- RLS are applied to all tables unless explicitly instructed otherwise
- RLS prevents data leakage between accounts
- User is prevented from updating fields that are not allowed to be updated (uses column-level permissions)
- Triggers for tracking timestamps and user tracking are used if required
- Schema is thorough and covers all data integrity and business rules, but is not unnecessarily complex or over-engineered
- Schema uses constraints/triggers where required for data integrity and business rules
- Schema prevents invalid data from being inserted or updated

**Code Quality Standards:**
- No unnecessary complexity or overly abstract code
- Consistent file structure following monorepo patterns
- Proper package organization in Turborepo structure
- Use of @portal/ui components and established patterns

{{#if severity_level}}
**Severity Filter:** Only report issues of {{severity_level}} severity or higher.
{{/if}}

**Please provide:**
1. **Overview:** Brief summary of code quality
2. **Issues Found:** List specific problems with severity levels
3. **Suggestions:** Concrete improvement recommendations
4. **Best Practices:** Relevant patterns from the Makerkit codebase
5. **Security Review:** Any security concerns or improvements`,
      examples: [
        'Review a React component for best practices',
        'Security-focused review of authentication code',
        'Performance analysis of database queries',
      ],
    },
    {
      name: 'supabase_rls_policy_design',
      title: 'Supabase RLS Policy Design',
      description:
        'Design Row Level Security policies for Makerkit multi-tenant architecture',
      category: 'database',
      arguments: [
        {
          name: 'table_name',
          description: 'Table that needs RLS policies',
          required: true,
          type: 'string',
        },
        {
          name: 'access_patterns',
          description: 'Who should access this data and how',
          required: true,
          type: 'text',
        },
        {
          name: 'data_sensitivity',
          description: 'Sensitivity level of the data',
          required: true,
          type: 'enum',
          options: [
            'public',
            'account-restricted',
            'role-restricted',
            'owner-only',
          ],
        },
      ],
      template: `Design RLS policies for table: {{table_name}}

**Access Requirements:** {{access_patterns}}
**Data Sensitivity:** {{data_sensitivity}}

**Please provide:**

**1. Policy Design:**
- Complete RLS policy definitions (SELECT, INSERT, UPDATE, DELETE)
- Use of existing Makerkit functions: has_role_on_account, has_permission
- Account-based access control following multi-tenant patterns

**2. Security Analysis:**
- How policies enforce account boundaries
- Role-based access control integration
- Prevention of data leakage between accounts

**3. Performance Considerations:**
- Index requirements for efficient policy execution
- Query optimization with RLS overhead
- Use of SECURITY DEFINER functions where needed

**4. Policy SQL:**
\`\`\`sql
-- Enable RLS
ALTER TABLE {{table_name}} ENABLE ROW LEVEL SECURITY;

-- Your policies here
\`\`\`

**5. Testing Strategy:**
- Test cases for different user roles and permissions
- Verification of account isolation
- Performance testing with large datasets

**Makerkit RLS Standards:**
- All user data must respect account boundaries
- Use existing permission functions for consistency
- Personal accounts: auth.users.id = accounts.id
- Team accounts: check via accounts_memberships table
- Leverage roles and role_permissions for granular access`,
      examples: [
        'Design RLS for a documents table',
        'Create policies for team collaboration data',
      ],
    },
  ];

  static getAllPrompts(): PromptTemplate[] {
    return this.prompts;
  }

  static getPromptsByCategory(category: string): PromptTemplate[] {
    return this.prompts.filter((prompt) => prompt.category === category);
  }

  static getPrompt(name: string): PromptTemplate | null {
    return this.prompts.find((prompt) => prompt.name === name) || null;
  }

  static searchPrompts(query: string): PromptTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.prompts.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(searchTerm) ||
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.category.toLowerCase().includes(searchTerm),
    );
  }

  static renderPrompt(name: string, args: Record<string, string>): string {
    const prompt = this.getPrompt(name);
    if (!prompt) {
      throw new Error(`Prompt "${name}" not found`);
    }

    // Simple template rendering with Handlebars-like syntax
    let rendered = prompt.template;

    // Replace {{variable}} placeholders
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return args[varName] || '';
    });

    // Replace {{variable || default}} placeholders
    rendered = rendered.replace(
      /\{\{(\w+)\s*\|\|\s*'([^']*)'\}\}/g,
      (match, varName, defaultValue) => {
        return args[varName] || defaultValue;
      },
    );

    // Handle conditional blocks {{#if variable}}...{{/if}}
    rendered = rendered.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, varName, content) => {
        return args[varName] ? content : '';
      },
    );

    return rendered.trim();
  }
}

export function registerPromptsSystem(server: McpServer) {
  // Register all prompts using the SDK's prompt API
  const allPrompts = PromptsManager.getAllPrompts();

  for (const promptTemplate of allPrompts) {
    // Convert arguments to proper Zod schema format
    const argsSchema = promptTemplate.arguments.reduce(
      (acc, arg) => {
        if (arg.required) {
          acc[arg.name] = z.string().describe(arg.description);
        } else {
          acc[arg.name] = z.string().optional().describe(arg.description);
        }
        return acc;
      },
      {} as Record<string, z.ZodString | z.ZodOptional<z.ZodString>>,
    );

    server.prompt(
      promptTemplate.name,
      promptTemplate.description,
      argsSchema,
      async (args: Record<string, string>) => {
        const renderedPrompt = PromptsManager.renderPrompt(
          promptTemplate.name,
          args,
        );

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: renderedPrompt,
              },
            },
          ],
        };
      },
    );
  }
}
