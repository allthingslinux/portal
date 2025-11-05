'use client';

import { useState } from 'react';

import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  SlashIcon,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@portal/ui/breadcrumb';
import { Card, CardContent } from '@portal/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';

import { generateImportStatement } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface BreadcrumbStoryControls {
  separator: 'chevron' | 'slash' | 'custom';
  showHome: boolean;
  showEllipsis: boolean;
  maxItems: number;
}

const breadcrumbItems = [
  { id: 'home', label: 'Home', href: '/', icon: HomeIcon },
  { id: 'docs', label: 'Documentation', href: '/docs' },
  {
    id: 'components',
    label: 'Components',
    href: '/docs/components',
  },
  {
    id: 'breadcrumb',
    label: 'Breadcrumb',
    href: '/docs/components/breadcrumb',
  },
];

export default function BreadcrumbStory() {
  const [controls, setControls] = useState<BreadcrumbStoryControls>({
    separator: 'chevron',
    showHome: true,
    showEllipsis: false,
    maxItems: 4,
  });

  const getSeparator = () => {
    switch (controls.separator) {
      case 'slash':
        return <SlashIcon className="h-4 w-4" />;
      case 'custom':
        return <span className="text-muted-foreground">→</span>;
      case 'chevron':
      default:
        return <ChevronRightIcon className="h-4 w-4" />;
    }
  };

  const getDisplayedItems = () => {
    const items = controls.showHome
      ? breadcrumbItems
      : breadcrumbItems.slice(1);

    if (!controls.showEllipsis || items.length <= controls.maxItems) {
      return items;
    }

    // Show first item, ellipsis, and last few items
    const remainingSlots = controls.maxItems - 2; // Reserve slots for first item and ellipsis
    const lastItems = items.slice(-remainingSlots);

    return [
      items[0],
      { id: 'ellipsis', label: '...', href: '#', ellipsis: true },
      ...lastItems,
    ];
  };

  const displayedItems = getDisplayedItems();

  // Controls section
  const controlsContent = (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Separator</label>
        <Select
          value={controls.separator}
          onValueChange={(value: BreadcrumbStoryControls['separator']) =>
            setControls((prev) => ({ ...prev, separator: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chevron">Chevron (›)</SelectItem>
            <SelectItem value="slash">Slash (/)</SelectItem>
            <SelectItem value="custom">Arrow (→)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Max Items</label>
        <Select
          value={controls.maxItems.toString()}
          onValueChange={(value: string) =>
            setControls((prev) => ({
              ...prev,
              maxItems: parseInt(value),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 items</SelectItem>
            <SelectItem value="3">3 items</SelectItem>
            <SelectItem value="4">4 items</SelectItem>
            <SelectItem value="5">5 items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="showHome"
            checked={controls.showHome}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, showHome: checked }))
            }
          />
          <label htmlFor="showHome" className="text-sm">
            Show Home
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="showEllipsis"
            checked={controls.showEllipsis}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, showEllipsis: checked }))
            }
          />
          <label htmlFor="showEllipsis" className="text-sm">
            Show Ellipsis
          </label>
        </div>
      </div>
    </div>
  );

  // Preview section
  const previewContent = (
    <div className="p-6">
      <Breadcrumb>
        <BreadcrumbList>
          {displayedItems.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && (
                <BreadcrumbSeparator>{getSeparator()}</BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {item.ellipsis ? (
                  <BreadcrumbEllipsis />
                ) : index === displayedItems.length - 1 ? (
                  <BreadcrumbPage
                    className={item.icon ? 'flex items-center gap-2' : ''}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className={item.icon ? 'flex items-center gap-2' : ''}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );

  // Examples section
  const examplesContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Simple Breadcrumb</h3>
        <Card>
          <CardContent className="pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Icons</h3>
        <Card>
          <CardContent className="pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/docs"
                    className="flex items-center gap-2"
                  >
                    <FolderIcon className="h-4 w-4" />
                    Documentation
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Breadcrumb
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Custom Separator</h3>
        <Card>
          <CardContent className="pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          With Ellipsis for Long Path
        </h3>
        <Card>
          <CardContent className="pt-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // API Reference section
  const apiReferenceContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Components</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">Component</th>
                <th className="p-2 text-left font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">Breadcrumb</td>
                <td className="p-2">
                  Root component that provides nav element
                </td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbList</td>
                <td className="p-2">
                  Ordered list container for breadcrumb items
                </td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbItem</td>
                <td className="p-2">Individual breadcrumb item container</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbLink</td>
                <td className="p-2">Navigable breadcrumb link</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbPage</td>
                <td className="p-2">Current page (non-navigable)</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbSeparator</td>
                <td className="p-2">Separator between breadcrumb items</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">BreadcrumbEllipsis</td>
                <td className="p-2">Ellipsis indicator for collapsed items</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Component Hierarchy</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Accessibility Features</h3>
        <div className="space-y-2 text-sm">
          <p>
            • <code>aria-label="breadcrumb"</code> on nav element
          </p>
          <p>
            • <code>aria-current="page"</code> on current page
          </p>
          <p>
            • <code>role="presentation"</code> on separators
          </p>
          <p>
            • <code>aria-hidden="true"</code> on decorative elements
          </p>
          <p>• Screen reader text for ellipsis ("More")</p>
        </div>
      </div>
    </div>
  );

  // Usage Guidelines section
  const usageGuidelinesContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Basic Usage</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Breadcrumbs provide navigation context and help users understand their
          location within a site hierarchy.
        </p>
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {`import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@portal/ui/breadcrumb';

function Navigation() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Custom Separator</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {`import { SlashIcon } from 'lucide-react';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <SlashIcon className="h-4 w-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Ellipsis</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="overflow-x-auto text-sm">
            {`import { BreadcrumbEllipsis } from '@portal/ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Structure</h4>
            <p>
              • Always use BreadcrumbPage for the current page (non-clickable)
            </p>
            <p>• Use BreadcrumbLink for navigable pages</p>
            <p>• Include separators between all items</p>
            <p>• Consider using ellipsis for deep hierarchies (4+ levels)</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Content</h4>
            <p>• Keep labels concise but descriptive</p>
            <p>• Match labels with actual page titles</p>
            <p>• Start with the highest level (usually "Home")</p>
            <p>• End with the current page</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Accessibility</h4>
            <p>• Always include aria-label="breadcrumb" on the nav</p>
            <p>• Use aria-current="page" on the current page</p>
            <p>• Ensure sufficient color contrast for links</p>
            <p>• Test with keyboard navigation</p>
          </div>
        </div>
      </div>
    </div>
  );

  const generateCode = () => {
    const items = getDisplayedItems();

    const importComponents = ['Breadcrumb', 'BreadcrumbList', 'BreadcrumbItem'];
    const hasLinks = items.some(
      (item) => !item.ellipsis && item.id !== items[items.length - 1].id,
    );
    const hasEllipsis = items.some((item) => item.ellipsis);

    if (hasLinks) importComponents.push('BreadcrumbLink');
    if (hasEllipsis) importComponents.push('BreadcrumbEllipsis');
    importComponents.push('BreadcrumbPage', 'BreadcrumbSeparator');

    const importStatement = generateImportStatement(
      importComponents,
      '@portal/ui/breadcrumb',
    );

    let separatorImport = '';
    let separatorComponent = '';

    if (controls.separator === 'slash') {
      separatorImport = "\nimport { SlashIcon } from 'lucide-react';";
      separatorComponent =
        '\n      <BreadcrumbSeparator>\n        <SlashIcon className="h-4 w-4" />\n      </BreadcrumbSeparator>';
    } else if (controls.separator === 'custom') {
      separatorComponent =
        '\n      <BreadcrumbSeparator>\n        <span className="text-muted-foreground">→</span>\n      </BreadcrumbSeparator>';
    } else {
      separatorComponent = '\n      <BreadcrumbSeparator />';
    }

    const breadcrumbItems = items
      .map((item, index) => {
        const isLast = index === items.length - 1;
        const separator = isLast ? '' : separatorComponent;

        if (item.ellipsis) {
          return `    <BreadcrumbItem>\n      <BreadcrumbEllipsis />\n    </BreadcrumbItem>${separator}`;
        }

        if (isLast) {
          return `    <BreadcrumbItem>\n      <BreadcrumbPage>${item.label}</BreadcrumbPage>\n    </BreadcrumbItem>`;
        }

        return `    <BreadcrumbItem>\n      <BreadcrumbLink href="${item.href}">${item.label}</BreadcrumbLink>\n    </BreadcrumbItem>${separator}`;
      })
      .join('\n');

    const breadcrumbComponent = `<Breadcrumb>\n  <BreadcrumbList>\n${breadcrumbItems}\n  </BreadcrumbList>\n</Breadcrumb>`;

    return `${importStatement}${separatorImport}\n\n${breadcrumbComponent}`;
  };

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Breadcrumb"
      previewDescription="Navigation showing hierarchical path"
      controlsTitle="Breadcrumb Configuration"
      controlsDescription="Customize breadcrumb appearance"
      generatedCode={generateCode()}
      examples={examplesContent}
      apiReference={apiReferenceContent}
      usageGuidelines={usageGuidelinesContent}
    />
  );
}

export { BreadcrumbStory };
