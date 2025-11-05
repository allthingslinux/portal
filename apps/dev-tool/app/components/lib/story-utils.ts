'use client';

import { useState } from 'react';

import { toast } from '@portal/ui/sonner';

/**
 * Generic hook for managing component story controls
 */
export function useStoryControls<T extends Record<string, any>>(
  initialState: T,
) {
  const [controls, setControls] = useState<T>(initialState);

  const updateControl = <K extends keyof T>(key: K, value: T[K]) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const resetControls = () => {
    setControls(initialState);
  };

  return {
    controls,
    updateControl,
    resetControls,
  };
}

/**
 * Hook for managing copy-to-clipboard functionality
 */
export function useCopyCode() {
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
      console.error('Failed to copy code:', error);
    }
  };

  return {
    copiedCode,
    copyCode,
  };
}

/**
 * Utility to generate props string from control values
 */
export function generatePropsString(
  controls: Record<string, any>,
  defaults: Record<string, any> = {},
  excludeKeys: string[] = [],
): string {
  const props: string[] = [];

  Object.entries(controls).forEach(([key, value]) => {
    if (excludeKeys.includes(key)) return;

    // Skip undefined values - omit the prop entirely
    if (value === undefined) return;

    const defaultValue = defaults[key];
    const hasDefault = defaultValue !== undefined;

    // Only include prop if it's different from default or there's no default
    if (!hasDefault || value !== defaultValue) {
      if (typeof value === 'boolean') {
        if (value) {
          props.push(key);
        }
      } else if (typeof value === 'string') {
        if (value) {
          props.push(`${key}="${value}"`);
        }
      } else {
        props.push(`${key}={${JSON.stringify(value)}}`);
      }
    }
  });

  return props.length > 0 ? ` ${props.join(' ')}` : '';
}

/**
 * Common tab configuration for component stories
 */
export interface StoryTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export const defaultStoryTabs = [
  { id: 'playground', label: 'Playground' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API Reference' },
  { id: 'usage', label: 'Usage Guidelines' },
];

/**
 * Option type for select components with descriptions
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

/**
 * Utility to format component imports for code generation
 */
export function generateImportStatement(
  components: string[],
  source: string,
): string {
  if (components.length === 1) {
    return `import { ${components[0]} } from '${source}';`;
  }

  if (components.length <= 3) {
    return `import { ${components.join(', ')} } from '${source}';`;
  }

  // Multi-line for many imports
  return `import {\n  ${components.join(',\n  ')}\n} from '${source}';`;
}

/**
 * Utility to create formatted code blocks
 */
export function formatCodeBlock(
  code: string,
  imports: string[] = [],
  language: 'tsx' | 'jsx' | 'javascript' | 'typescript' = 'tsx',
): string {
  let formattedCode = '';

  if (imports.length > 0) {
    formattedCode += imports.join('\n') + '\n\n';
  }

  formattedCode += code;

  return formattedCode;
}
