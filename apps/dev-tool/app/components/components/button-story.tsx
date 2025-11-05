'use client';

import { Download, Loader2, Mail, Plus, Settings } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface ButtonControls {
  variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  disabled: boolean;
  loading: boolean;
  withIcon: boolean;
  fullWidth: boolean;
  asChild: boolean;
}

const variantOptions = [
  { value: 'default', label: 'Default', description: 'Primary action button' },
  {
    value: 'destructive',
    label: 'Destructive',
    description: 'For dangerous actions',
  },
  { value: 'outline', label: 'Outline', description: 'Secondary actions' },
  {
    value: 'secondary',
    label: 'Secondary',
    description: 'Less prominent actions',
  },
  { value: 'ghost', label: 'Ghost', description: 'Minimal styling' },
  { value: 'link', label: 'Link', description: 'Looks like a link' },
] as const;

const sizeOptions = [
  { value: 'sm', label: 'Small', description: '32px height' },
  { value: 'default', label: 'Default', description: '40px height' },
  { value: 'lg', label: 'Large', description: '48px height' },
  { value: 'icon', label: 'Icon', description: 'Square button for icons' },
] as const;

export function ButtonStory() {
  const { controls, updateControl } = useStoryControls<ButtonControls>({
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    withIcon: false,
    fullWidth: false,
    asChild: false,
  });

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        variant: controls.variant,
        size: controls.size,
        disabled: controls.disabled,
        asChild: controls.asChild,
        className: controls.fullWidth ? 'w-full' : '',
      },
      {
        variant: 'default',
        size: 'default',
        disabled: false,
        asChild: false,
        className: '',
      },
    );

    let code = `<Button${propsString}>`;

    if (controls.loading) {
      code += `\n  <Loader2 className="mr-2 h-4 w-4 animate-spin" />`;
    } else if (controls.withIcon && controls.size !== 'icon') {
      code += `\n  <Plus className="mr-2 h-4 w-4" />`;
    }

    if (controls.size === 'icon') {
      code += `\n  <Plus className="h-4 w-4" />`;
    } else {
      const buttonText = controls.loading ? 'Loading...' : 'Button';
      if (controls.loading || controls.withIcon) {
        code += `\n  ${buttonText}`;
      } else {
        code += buttonText;
      }
    }

    code += `\n</Button>`;

    return code;
  };

  const renderPreview = () => (
    <Button
      variant={controls.variant}
      size={controls.size}
      disabled={controls.disabled || controls.loading}
      className={cn(controls.fullWidth && 'w-full')}
    >
      {controls.loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {controls.withIcon && controls.size !== 'icon' && (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {controls.size === 'icon' ? <Plus className="h-4 w-4" /> : 'Button'}
        </>
      )}
    </Button>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="variant">Variant</Label>
        <SimpleStorySelect
          value={controls.variant}
          onValueChange={(value) => updateControl('variant', value)}
          options={variantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Size</Label>
        <SimpleStorySelect
          value={controls.size}
          onValueChange={(value) => updateControl('size', value)}
          options={sizeOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="disabled">Disabled</Label>
        <Switch
          id="disabled"
          checked={controls.disabled}
          onCheckedChange={(checked) => updateControl('disabled', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="loading">Loading</Label>
        <Switch
          id="loading"
          checked={controls.loading}
          onCheckedChange={(checked) => updateControl('loading', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="withIcon">With Icon</Label>
        <Switch
          id="withIcon"
          checked={controls.withIcon}
          disabled={controls.size === 'icon'}
          onCheckedChange={(checked) => updateControl('withIcon', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="fullWidth">Full Width</Label>
        <Switch
          id="fullWidth"
          checked={controls.fullWidth}
          onCheckedChange={(checked) => updateControl('fullWidth', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="asChild">As Child</Label>
        <Switch
          id="asChild"
          checked={controls.asChild}
          onCheckedChange={(checked) => updateControl('asChild', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different button styles for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
          <CardDescription>
            Different button sizes for various contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button States</CardTitle>
          <CardDescription>Loading and disabled states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button disabled>
              <Mail className="mr-2 h-4 w-4" />
              Disabled
            </Button>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complex Button Layouts</CardTitle>
          <CardDescription>Advanced button configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Full Width Button
            </Button>

            <div className="flex gap-2">
              <Button className="flex-1">Primary</Button>
              <Button variant="outline" className="flex-1">
                Secondary
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
              <Button className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Badge variant="secondary" className="px-2 py-1">
                New
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Button Component</CardTitle>
        <CardDescription>
          Complete API reference for Button component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Button</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A clickable element that triggers an action or event.
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
                    <td className="p-3 font-mono text-sm">variant</td>
                    <td className="p-3 font-mono text-sm">
                      'default' | 'destructive' | 'outline' | 'secondary' |
                      'ghost' | 'link'
                    </td>
                    <td className="p-3 font-mono text-sm">'default'</td>
                    <td className="p-3">Visual style variant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">size</td>
                    <td className="p-3 font-mono text-sm">
                      'default' | 'sm' | 'lg' | 'icon'
                    </td>
                    <td className="p-3 font-mono text-sm">'default'</td>
                    <td className="p-3">Button size</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">disabled</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Disable the button</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Button content</td>
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
          <CardTitle>When to Use Buttons</CardTitle>
          <CardDescription>Best practices for button usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Buttons For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Triggering actions (submit, save, delete)</li>
              <li>• Navigation to different pages or sections</li>
              <li>• Opening modals or dialogs</li>
              <li>• Starting processes or workflows</li>
              <li>• Toggling states or settings</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Buttons For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Displaying static content</li>
              <li>• Non-interactive decorative elements</li>
              <li>• Links to external websites (use links instead)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Hierarchy</CardTitle>
          <CardDescription>Using button variants effectively</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button size="sm">Primary</Button>
                <h4 className="text-sm font-semibold">Default (Primary)</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Main actions, form submissions, primary CTAs
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Secondary
                </Button>
                <h4 className="text-sm font-semibold">Outline (Secondary)</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Secondary actions, cancel buttons, alternative options
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Tertiary
                </Button>
                <h4 className="text-sm font-semibold">Ghost (Tertiary)</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Subtle actions, toolbar buttons, optional actions
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button variant="destructive" size="sm">
                  Destructive
                </Button>
                <h4 className="text-sm font-semibold">Destructive</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Delete actions, dangerous operations, permanent changes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Making buttons accessible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              Buttons are focusable and can be activated with Enter or Space
              keys.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Readers</h4>
            <p className="text-muted-foreground text-sm">
              Use descriptive button text. Avoid generic text like "Click here"
              or "Read more".
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Loading States</h4>
            <p className="text-muted-foreground text-sm">
              When buttons show loading states, ensure they communicate the
              current status to screen readers.
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
