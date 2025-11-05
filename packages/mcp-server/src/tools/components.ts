import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

interface ComponentInfo {
  name: string;
  exportPath: string;
  filePath: string;
  category: 'shadcn' | 'makerkit' | 'utils';
  description: string;
}

export class ComponentsTool {
  static async getComponents(): Promise<ComponentInfo[]> {
    const packageJsonPath = join(
      process.cwd(),
      'packages',
      'ui',
      'package.json',
    );
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    const components: ComponentInfo[] = [];

    for (const [exportName, filePath] of Object.entries(packageJson.exports)) {
      if (typeof filePath === 'string' && filePath.endsWith('.tsx')) {
        const category = this.determineCategory(filePath);
        const description = await this.generateDescription(
          exportName,
          filePath,
          category,
        );

        components.push({
          name: exportName.replace('./', ''),
          exportPath: exportName,
          filePath: filePath,
          category,
          description,
        });
      }
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async searchComponents(query: string): Promise<ComponentInfo[]> {
    const allComponents = await this.getComponents();
    const searchTerm = query.toLowerCase();

    return allComponents.filter((component) => {
      return (
        component.name.toLowerCase().includes(searchTerm) ||
        component.description.toLowerCase().includes(searchTerm) ||
        component.category.toLowerCase().includes(searchTerm)
      );
    });
  }

  static async getComponentProps(componentName: string): Promise<{
    componentName: string;
    props: Array<{
      name: string;
      type: string;
      optional: boolean;
      description?: string;
    }>;
    interfaces: string[];
    variants?: Record<string, string[]>;
  }> {
    const content = await this.getComponentContent(componentName);

    return {
      componentName,
      props: this.extractProps(content),
      interfaces: this.extractInterfaces(content),
      variants: this.extractVariants(content),
    };
  }

  private static extractProps(content: string): Array<{
    name: string;
    type: string;
    optional: boolean;
    description?: string;
  }> {
    const props: Array<{
      name: string;
      type: string;
      optional: boolean;
      description?: string;
    }> = [];

    // Look for interface definitions that end with "Props"
    const interfaceRegex =
      /interface\s+(\w*Props)\s*(?:extends[^{]*?)?\s*{([^}]*)}/gs;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceBody = match[2];
      const propLines = interfaceBody
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      for (const line of propLines) {
        // Skip comments and empty lines
        if (
          line.startsWith('//') ||
          line.startsWith('*') ||
          !line.includes(':')
        )
          continue;

        // Extract prop name and type
        const propMatch = line.match(/(\w+)(\?)?\s*:\s*([^;,]+)/);
        if (propMatch) {
          const [, name, optional, type] = propMatch;
          props.push({
            name,
            type: type.trim(),
            optional: Boolean(optional),
          });
        }
      }
    }

    return props;
  }

  private static extractInterfaces(content: string): string[] {
    const interfaces: string[] = [];
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }

    return interfaces;
  }

  private static extractVariants(
    content: string,
  ): Record<string, string[]> | undefined {
    // Look for CVA (class-variance-authority) variants
    const cvaRegex = /cva\s*\([^,]*,\s*{[^}]*variants:\s*{([^}]*)}/s;
    const match = cvaRegex.exec(content);

    if (!match) return undefined;

    const variantsSection = match[1];
    const variants: Record<string, string[]> = {};

    // Extract each variant category
    const variantRegex = /(\w+):\s*{([^}]*)}/g;
    let variantMatch;

    while ((variantMatch = variantRegex.exec(variantsSection)) !== null) {
      const [, variantName, variantOptions] = variantMatch;
      const options: string[] = [];

      // Extract option names
      const optionRegex = /(\w+):/g;
      let optionMatch;

      while ((optionMatch = optionRegex.exec(variantOptions)) !== null) {
        options.push(optionMatch[1]);
      }

      if (options.length > 0) {
        variants[variantName] = options;
      }
    }

    return Object.keys(variants).length > 0 ? variants : undefined;
  }

  static async getComponentContent(componentName: string): Promise<string> {
    const packageJsonPath = join(
      process.cwd(),
      'packages',
      'ui',
      'package.json',
    );
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    const exportPath = `./${componentName}`;
    const filePath = packageJson.exports[exportPath];

    if (!filePath) {
      throw new Error(`Component "${componentName}" not found in exports`);
    }

    const fullPath = join(process.cwd(), 'packages', 'ui', filePath);
    return readFile(fullPath, 'utf8');
  }

  private static determineCategory(
    filePath: string,
  ): 'shadcn' | 'makerkit' | 'utils' {
    if (filePath.includes('/shadcn/')) return 'shadcn';
    if (filePath.includes('/makerkit/')) return 'makerkit';
    return 'utils';
  }

  private static async generateDescription(
    exportName: string,
    _filePath: string,
    category: 'shadcn' | 'makerkit' | 'utils',
  ): Promise<string> {
    const componentName = exportName.replace('./', '');

    if (category === 'shadcn') {
      return this.getShadcnDescription(componentName);
    } else if (category === 'makerkit') {
      return this.getMakerkitDescription(componentName);
    } else {
      return this.getUtilsDescription(componentName);
    }
  }

  private static getShadcnDescription(componentName: string): string {
    const descriptions: Record<string, string> = {
      accordion:
        'A vertically stacked set of interactive headings that each reveal a section of content',
      'alert-dialog':
        'A modal dialog that interrupts the user with important content and expects a response',
      alert:
        'Displays a callout for user attention with different severity levels',
      avatar: 'An image element with a fallback for representing the user',
      badge: 'A small status descriptor for UI elements',
      breadcrumb:
        'Displays the path to the current resource using a hierarchy of links',
      button: 'Displays a button or a component that looks like a button',
      calendar:
        'A date field component that allows users to enter and edit date',
      card: 'Displays a card with header, content, and footer',
      chart: 'A collection of chart components built on top of Recharts',
      checkbox:
        'A control that allows the user to toggle between checked and not checked',
      collapsible: 'An interactive component which can be expanded/collapsed',
      command: 'A fast, composable, unstyled command menu for React',
      'data-table': 'A powerful table component built on top of TanStack Table',
      dialog:
        'A window overlaid on either the primary window or another dialog window',
      'dropdown-menu': 'Displays a menu to the user triggered by a button',
      form: 'Building forms with validation and error handling',
      heading: 'Typography component for displaying headings',
      input:
        'Displays a form input field or a component that looks like an input field',
      'input-otp':
        'Accessible one-time password component with copy paste functionality',
      label: 'Renders an accessible label associated with controls',
      'navigation-menu': 'A collection of links for navigating websites',
      popover: 'Displays rich content in a portal, triggered by a button',
      progress:
        'Displays an indicator showing the completion progress of a task',
      'radio-group':
        'A set of checkable buttons where no more than one can be checked at a time',
      'scroll-area':
        'Augments native scroll functionality for custom, cross-browser styling',
      select: 'Displays a list of options for the user to pick from',
      separator: 'Visually or semantically separates content',
      sheet:
        'Extends the Dialog component to display content that complements the main content of the screen',
      sidebar: 'A collapsible sidebar component with navigation',
      skeleton: 'Use to show a placeholder while content is loading',
      slider:
        'An input where the user selects a value from within a given range',
      sonner: 'An opinionated toast component for React',
      switch:
        'A control that allows the user to toggle between checked and not checked',
      table: 'A responsive table component',
      tabs: 'A set of layered sections of content - known as tab panels - that are displayed one at a time',
      textarea:
        'Displays a form textarea or a component that looks like a textarea',
      tooltip:
        'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it',
    };

    return (
      descriptions[componentName] || `Shadcn UI component: ${componentName}`
    );
  }

  private static getMakerkitDescription(componentName: string): string {
    const descriptions: Record<string, string> = {
      if: 'Conditional rendering component that shows children only when condition is true',
      trans:
        'Internationalization component for translating text with interpolation support',
      sidebar:
        'Application sidebar component with navigation and collapsible functionality',
      'bordered-navigation-menu':
        'Navigation menu component with bordered styling',
      spinner: 'Loading spinner component with customizable size and styling',
      page: 'Page layout component that provides consistent structure and styling',
      'image-uploader':
        'Component for uploading and displaying images with drag-and-drop support',
      'global-loader':
        'Global loading indicator component for application-wide loading states',
      'loading-overlay':
        'Overlay component that shows loading state over content',
      'profile-avatar':
        'User profile avatar component with fallback and customization options',
      'enhanced-data-table':
        'Enhanced data table component with sorting, filtering, and pagination (best table component)',
      'language-selector':
        'Component for selecting application language/locale',
      stepper: 'Step-by-step navigation component for multi-step processes',
      'card-button': 'Clickable card component that acts as a button',
      'multi-step-form':
        'Multi-step form component with validation and navigation',
      'app-breadcrumbs': 'Application breadcrumb navigation component',
      'empty-state':
        'Component for displaying empty states with customizable content',
      marketing: 'Collection of marketing-focused components and layouts',
      'file-uploader':
        'File upload component with drag-and-drop and preview functionality',
    };

    return (
      descriptions[componentName] ||
      `Makerkit custom component: ${componentName}`
    );
  }

  private static getUtilsDescription(componentName: string): string {
    const descriptions: Record<string, string> = {
      utils:
        'Utility functions for styling, class management, and common operations',
      'navigation-schema': 'Schema and types for navigation configuration',
    };

    return descriptions[componentName] || `Utility module: ${componentName}`;
  }
}

export function registerComponentsTools(server: McpServer) {
  createGetComponentsTool(server);
  createGetComponentContentTool(server);
  createComponentsSearchTool(server);
  createGetComponentPropsTool(server);
}

function createGetComponentsTool(server: McpServer) {
  return server.tool(
    'get_components',
    'Get all available UI components from the @portal/ui package with descriptions',
    async () => {
      const components = await ComponentsTool.getComponents();

      const componentsList = components
        .map(
          (component) =>
            `${component.name} (${component.category}): ${component.description}`,
        )
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: componentsList,
          },
        ],
      };
    },
  );
}

function createGetComponentContentTool(server: McpServer) {
  return server.tool(
    'get_component_content',
    'Get the source code content of a specific UI component',
    {
      state: z.object({
        componentName: z.string(),
      }),
    },
    async ({ state }) => {
      const content = await ComponentsTool.getComponentContent(
        state.componentName,
      );

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    },
  );
}

function createComponentsSearchTool(server: McpServer) {
  return server.tool(
    'components_search',
    'Search UI components by keyword in name, description, or category',
    {
      state: z.object({
        query: z.string(),
      }),
    },
    async ({ state }) => {
      const components = await ComponentsTool.searchComponents(state.query);

      if (components.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No components found matching "${state.query}"`,
            },
          ],
        };
      }

      const componentsList = components
        .map(
          (component) =>
            `${component.name} (${component.category}): ${component.description}`,
        )
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${components.length} components matching "${state.query}":\n\n${componentsList}`,
          },
        ],
      };
    },
  );
}

function createGetComponentPropsTool(server: McpServer) {
  return server.tool(
    'get_component_props',
    'Extract component props, interfaces, and variants from a UI component',
    {
      state: z.object({
        componentName: z.string(),
      }),
    },
    async ({ state }) => {
      const propsInfo = await ComponentsTool.getComponentProps(
        state.componentName,
      );

      let result = `Component: ${propsInfo.componentName}\n\n`;

      if (propsInfo.interfaces.length > 0) {
        result += `Interfaces: ${propsInfo.interfaces.join(', ')}\n\n`;
      }

      if (propsInfo.props.length > 0) {
        result += `Props:\n`;
        propsInfo.props.forEach((prop) => {
          const optional = prop.optional ? '?' : '';
          result += `  - ${prop.name}${optional}: ${prop.type}\n`;
        });
        result += '\n';
      }

      if (propsInfo.variants) {
        result += `Variants (CVA):\n`;
        Object.entries(propsInfo.variants).forEach(([variantName, options]) => {
          result += `  - ${variantName}: ${options.join(' | ')}\n`;
        });
        result += '\n';
      }

      if (propsInfo.props.length === 0 && !propsInfo.variants) {
        result +=
          'No props or variants found. This might be a simple component or utility.';
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    },
  );
}
