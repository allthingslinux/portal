'use client';

import { Bell, FileText, Package, Plus, Search, Users } from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  EmptyMedia,
  EmptyState,
  EmptyStateButton,
  EmptyStateHeading,
  EmptyStateText,
} from '@portal/ui/empty-state';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { StorySelect } from './story-select';

interface EmptyStateControls {
  heading: string;
  text: string;
  showButton: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  showExtraContent: boolean;
  className: string;
  minHeight: string;
}

export function EmptyStateStory() {
  const { controls, updateControl } = useStoryControls<EmptyStateControls>({
    heading: 'No projects yet',
    text: 'Get started by creating your first project.',
    showButton: true,
    buttonText: 'Create Project',
    buttonVariant: 'default',
    showExtraContent: false,
    className: '',
    minHeight: '200px',
  });

  const generateCode = () => {
    const containerProps = generatePropsString(
      {
        className: controls.className || `min-h-[${controls.minHeight}]`,
      },
      {
        className: '',
      },
    );

    let code = `<EmptyState${containerProps}>\n`;
    code += `  <EmptyStateHeading>${controls.heading}</EmptyStateHeading>\n`;
    code += `  <EmptyStateText>\n    ${controls.text}\n  </EmptyStateText>\n`;

    if (controls.showButton) {
      const buttonProps = generatePropsString(
        { variant: controls.buttonVariant },
        { variant: 'default' },
      );
      code += `  <EmptyStateButton${buttonProps}>${controls.buttonText}</EmptyStateButton>\n`;
    }

    if (controls.showExtraContent) {
      code += `  <div className="mt-2">\n`;
      code += `    <Button variant="link" size="sm">\n`;
      code += `      Learn more\n`;
      code += `    </Button>\n`;
      code += `  </div>\n`;
    }

    code += `</EmptyState>`;
    return code;
  };

  const buttonVariantOptions = [
    {
      value: 'default' as const,
      label: 'Default',
      description: 'Primary action button',
    },
    {
      value: 'outline' as const,
      label: 'Outline',
      description: 'Secondary action',
    },
    {
      value: 'secondary' as const,
      label: 'Secondary',
      description: 'Alternative style',
    },
    {
      value: 'ghost' as const,
      label: 'Ghost',
      description: 'Minimal style',
    },
    {
      value: 'destructive' as const,
      label: 'Destructive',
      description: 'Danger/delete action',
    },
  ];

  const renderPreview = () => (
    <EmptyState
      className={controls.className || `min-h-[${controls.minHeight}]`}
    >
      <EmptyStateHeading>{controls.heading}</EmptyStateHeading>
      <EmptyStateText>{controls.text}</EmptyStateText>
      {controls.showButton && (
        <EmptyStateButton variant={controls.buttonVariant}>
          {controls.buttonText}
        </EmptyStateButton>
      )}
      {controls.showExtraContent && (
        <div className="mt-2">
          <Button variant="link" size="sm">
            Learn more
          </Button>
        </div>
      )}
    </EmptyState>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={controls.heading}
          onChange={(e) => updateControl('heading', e.target.value)}
          placeholder="Enter heading text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Description Text</Label>
        <Textarea
          id="text"
          value={controls.text}
          onChange={(e) => updateControl('text', e.target.value)}
          placeholder="Enter description text"
          rows={2}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="showButton">Show Button</Label>
        <Switch
          id="showButton"
          checked={controls.showButton}
          onCheckedChange={(checked) => updateControl('showButton', checked)}
        />
      </div>

      {controls.showButton && (
        <>
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={controls.buttonText}
              onChange={(e) => updateControl('buttonText', e.target.value)}
              placeholder="Enter button text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonVariant">Button Variant</Label>
            <StorySelect
              value={controls.buttonVariant}
              onValueChange={(value) => updateControl('buttonVariant', value)}
              options={buttonVariantOptions}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="showExtraContent">Show Extra Content</Label>
        <Switch
          id="showExtraContent"
          checked={controls.showExtraContent}
          onCheckedChange={(checked) =>
            updateControl('showExtraContent', checked)
          }
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="minHeight">Minimum Height</Label>
        <Input
          id="minHeight"
          value={controls.minHeight}
          onChange={(e) => updateControl('minHeight', e.target.value)}
          placeholder="e.g. 200px, 300px"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Custom Classes</Label>
        <Input
          id="className"
          value={controls.className}
          onChange={(e) => updateControl('className', e.target.value)}
          placeholder="e.g. bg-gray-50"
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
          <CardDescription>
            Empty state patterns for different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <EmptyState className="min-h-[200px]">
            <EmptyStateHeading>No projects yet</EmptyStateHeading>
            <EmptyStateText>
              Get started by creating your first project.
            </EmptyStateText>
            <EmptyStateButton>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </EmptyStateButton>
          </EmptyState>

          <EmptyState className="min-h-[200px]">
            <EmptyStateHeading>No results found</EmptyStateHeading>
            <EmptyStateText>
              Try adjusting your search or filter criteria.
            </EmptyStateText>
            <EmptyStateButton variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Clear filters
            </EmptyStateButton>
          </EmptyState>

          <EmptyState className="min-h-[200px]">
            <EmptyStateHeading>No team members</EmptyStateHeading>
            <EmptyStateText>
              Invite team members to collaborate on your projects.
            </EmptyStateText>
            <EmptyStateButton>
              <Users className="mr-2 h-4 w-4" />
              Invite Members
            </EmptyStateButton>
            <div className="mt-2">
              <Button variant="link" size="sm">
                Learn more about teams
              </Button>
            </div>
          </EmptyState>

          <EmptyState className="min-h-[200px]">
            <EmptyStateHeading>No notifications</EmptyStateHeading>
            <EmptyStateText>
              You're all caught up! Check back later.
            </EmptyStateText>
          </EmptyState>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>With Icons</CardTitle>
          <CardDescription>
            Empty states enhanced with descriptive icons
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <EmptyState className="min-h-[200px]">
            <EmptyMedia variant="icon">
              <Package className="text-muted-foreground h-8 w-8" />
            </EmptyMedia>
            <EmptyStateHeading>No products</EmptyStateHeading>
            <EmptyStateText>
              Add your first product to start selling.
            </EmptyStateText>
            <EmptyStateButton>Add Product</EmptyStateButton>
          </EmptyState>

          <EmptyState className="min-h-[200px]">
            <EmptyMedia variant="icon">
              <FileText className="text-muted-foreground h-8 w-8" />
            </EmptyMedia>
            <EmptyStateHeading>No documents</EmptyStateHeading>
            <EmptyStateText>
              Upload or create your first document.
            </EmptyStateText>
            <EmptyStateButton variant="outline">
              Upload Document
            </EmptyStateButton>
          </EmptyState>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Different Styles</CardTitle>
          <CardDescription>Various empty state presentations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmptyState className="bg-muted/10 min-h-[150px] border-2 border-dashed">
            <EmptyStateHeading>Drag and drop files here</EmptyStateHeading>
            <EmptyStateText>Or click to browse your computer</EmptyStateText>
            <EmptyStateButton variant="secondary">
              Browse Files
            </EmptyStateButton>
          </EmptyState>

          <EmptyState className="min-h-[150px] border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <EmptyStateHeading className="text-blue-900">
              Premium feature
            </EmptyStateHeading>
            <EmptyStateText className="text-blue-700">
              Upgrade your plan to access this feature.
            </EmptyStateText>
            <EmptyStateButton className="bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </EmptyStateButton>
          </EmptyState>

          <EmptyState className="min-h-[150px] border-0 shadow-none">
            <EmptyStateHeading>Coming soon</EmptyStateHeading>
            <EmptyStateText>
              This feature is under development. Stay tuned!
            </EmptyStateText>
            <EmptyStateButton variant="ghost">
              <Bell className="mr-2 h-4 w-4" />
              Get Notified
            </EmptyStateButton>
          </EmptyState>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>EmptyState Components</CardTitle>
        <CardDescription>
          Complete API reference for EmptyState components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* EmptyState */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">EmptyState</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Container component that renders child components in a centered
              layout with dashed border.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Prop</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Default</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">
                      Content including EmptyStateHeading, EmptyStateText, and
                      EmptyStateButton
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* EmptyStateHeading */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">EmptyStateHeading</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Heading text for the empty state. Renders as an h3 element.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Prop</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3">Heading text content</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* EmptyStateText */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">EmptyStateText</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Descriptive text explaining the empty state. Renders as a
              paragraph element.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Prop</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3">Description text content</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* EmptyStateButton */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">EmptyStateButton</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Call-to-action button. Extends the Button component with all its
              props.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Prop</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">variant</td>
                    <td className="p-3 font-mono text-sm">
                      'default' | 'outline' | 'secondary' | 'ghost' |
                      'destructive'
                    </td>
                    <td className="p-3">Button style variant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">size</td>
                    <td className="p-3 font-mono text-sm">
                      'default' | 'sm' | 'lg' | 'icon'
                    </td>
                    <td className="p-3">Button size</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">onClick</td>
                    <td className="p-3 font-mono text-sm">() =&gt; void</td>
                    <td className="p-3">Click event handler</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">...props</td>
                    <td className="p-3 font-mono text-sm">ButtonProps</td>
                    <td className="p-3">All other Button component props</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>When to Use Empty States</CardTitle>
          <CardDescription>
            Best practices for empty state usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Empty States For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• First-time user experiences</li>
              <li>• Search results with no matches</li>
              <li>• Empty lists or collections</li>
              <li>• Filtered views with no results</li>
              <li>• Error states where content cannot be loaded</li>
              <li>• Features that require user action to populate</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Empty States For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Loading states (use skeletons or spinners)</li>
              <li>• Form validation messages</li>
              <li>• System notifications</li>
              <li>• Content that will auto-populate</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
          <CardDescription>
            Writing effective empty state content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Be Helpful</h4>
            <p className="text-muted-foreground text-sm">
              Explain why the area is empty and what the user can do about it.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Be Positive</h4>
            <p className="text-muted-foreground text-sm">
              Frame the message positively. Focus on what users can do, not
              what's missing.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Provide Clear Actions</h4>
            <p className="text-muted-foreground text-sm">
              Include a primary call-to-action that helps users move forward.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keep It Brief</h4>
            <p className="text-muted-foreground text-sm">
              Use concise language. Users should understand the state at a
              glance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Considerations</CardTitle>
          <CardDescription>Visual design best practices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Use Appropriate Imagery</h4>
            <p className="text-muted-foreground text-sm">
              Icons or illustrations can make empty states more engaging and
              help communicate the message.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Maintain Visual Hierarchy</h4>
            <p className="text-muted-foreground text-sm">
              The heading should be prominent, followed by descriptive text,
              then the action button.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Consider Context</h4>
            <p className="text-muted-foreground text-sm">
              The empty state should feel integrated with the surrounding
              interface, not jarring or out of place.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={renderPreview()}
      controls={renderControls()}
      generatedCode={generateCode()}
      examples={renderExamples()}
      apiReference={renderApiReference()}
      usageGuidelines={renderUsageGuidelines()}
    />
  );
}
