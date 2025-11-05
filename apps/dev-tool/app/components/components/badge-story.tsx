'use client';

import { useState } from 'react';

import { AlertTriangle, CheckCircle, Clock, Crown, X, Zap } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface BadgeControls {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  text: string;
  withIcon: boolean;
  iconPosition: 'left' | 'right';
  size: 'default' | 'sm' | 'lg';
  className: string;
}

const variantOptions = [
  { value: 'default', label: 'Default', description: 'Primary badge style' },
  { value: 'secondary', label: 'Secondary', description: 'Muted badge style' },
  {
    value: 'destructive',
    label: 'Destructive',
    description: 'Error or warning style',
  },
  { value: 'outline', label: 'Outline', description: 'Outlined badge style' },
] as const;

const sizeOptions = [
  { value: 'sm', label: 'Small', description: 'Compact size' },
  { value: 'default', label: 'Default', description: 'Standard size' },
  { value: 'lg', label: 'Large', description: 'Larger size' },
] as const;

const iconOptions = [
  { value: 'crown', icon: Crown, label: 'Crown' },
  { value: 'zap', icon: Zap, label: 'Zap' },
  { value: 'alert', icon: AlertTriangle, label: 'Alert' },
  { value: 'check', icon: CheckCircle, label: 'Check' },
  { value: 'clock', icon: Clock, label: 'Clock' },
  { value: 'x', icon: X, label: 'X' },
];

export function BadgeStory() {
  const { controls, updateControl } = useStoryControls<BadgeControls>({
    variant: 'default',
    text: 'Badge',
    withIcon: false,
    iconPosition: 'left',
    size: 'default',
    className: '',
  });

  const [selectedIcon, setSelectedIcon] = useState('crown');

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || Crown;

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        variant: controls.variant,
        className: cn(
          controls.className,
          controls.size === 'sm' && 'px-1.5 py-0.5 text-xs',
          controls.size === 'lg' && 'px-3 py-1 text-sm',
        ),
      },
      {
        variant: 'default',
        className: '',
      },
    );

    let code = `<Badge${propsString}>`;

    if (controls.withIcon) {
      const iconName = selectedIconData?.icon.name || 'Crown';
      if (controls.iconPosition === 'left') {
        code += `\n  <${iconName} className="mr-1 h-3 w-3" />`;
      }
    }

    code += `\n  ${controls.text}`;

    if (controls.withIcon && controls.iconPosition === 'right') {
      const iconName = selectedIconData?.icon.name || 'Crown';
      code += `\n  <${iconName} className="ml-1 h-3 w-3" />`;
    }

    code += `\n</Badge>`;

    return code;
  };

  const renderPreview = () => (
    <Badge
      variant={controls.variant}
      className={cn(
        controls.className,
        controls.size === 'sm' && 'px-1.5 py-0.5 text-xs',
        controls.size === 'lg' && 'px-3 py-1 text-sm',
      )}
    >
      {controls.withIcon && controls.iconPosition === 'left' && (
        <IconComponent className="mr-1 h-3 w-3" />
      )}
      {controls.text}
      {controls.withIcon && controls.iconPosition === 'right' && (
        <IconComponent className="ml-1 h-3 w-3" />
      )}
    </Badge>
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

      <div className="space-y-2">
        <Label htmlFor="text">Badge Text</Label>
        <Input
          id="text"
          value={controls.text}
          onChange={(e) => updateControl('text', e.target.value)}
          placeholder="Enter badge text"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="withIcon">With Icon</Label>
        <Switch
          id="withIcon"
          checked={controls.withIcon}
          onCheckedChange={(checked) => updateControl('withIcon', checked)}
        />
      </div>

      {controls.withIcon && (
        <>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <SimpleStorySelect
              value={selectedIcon}
              onValueChange={setSelectedIcon}
              options={iconOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                description: `${opt.label} icon`,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconPosition">Icon Position</Label>
            <SimpleStorySelect
              value={controls.iconPosition}
              onValueChange={(value) => updateControl('iconPosition', value)}
              options={[
                {
                  value: 'left',
                  label: 'Left',
                  description: 'Icon before text',
                },
                {
                  value: 'right',
                  label: 'Right',
                  description: 'Icon after text',
                },
              ]}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="className">Custom Classes</Label>
        <Input
          id="className"
          value={controls.className}
          onChange={(e) => updateControl('className', e.target.value)}
          placeholder="e.g. border-2 shadow-lg"
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>Different badge styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badge Sizes</CardTitle>
          <CardDescription>Different badge sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="px-1.5 py-0.5 text-xs">Small</Badge>
            <Badge>Default</Badge>
            <Badge className="px-3 py-1 text-sm">Large</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges with Icons</CardTitle>
          <CardDescription>Badges enhanced with icons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge>
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
            <Badge variant="secondary">
              <CheckCircle className="mr-1 h-3 w-3" />
              Verified
            </Badge>
            <Badge variant="destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Warning
            </Badge>
            <Badge variant="outline">
              New
              <Zap className="ml-1 h-3 w-3" />
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Badge Component</CardTitle>
        <CardDescription>
          Complete API reference for Badge component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Badge</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A small labeled status indicator or category tag.
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
                      'default' | 'secondary' | 'destructive' | 'outline'
                    </td>
                    <td className="p-3 font-mono text-sm">'default'</td>
                    <td className="p-3">Visual style variant</td>
                  </tr>
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
                    <td className="p-3">Badge content</td>
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
          <CardTitle>When to Use Badges</CardTitle>
          <CardDescription>Best practices for badge usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Badges For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Status indicators (new, verified, premium)</li>
              <li>• Category labels and tags</li>
              <li>• Notification counts</li>
              <li>• Feature flags and labels</li>
              <li>• Version or type indicators</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Badges For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Long text content (use cards instead)</li>
              <li>• Interactive elements (use buttons instead)</li>
              <li>• Main navigation items</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badge Hierarchy</CardTitle>
          <CardDescription>Using badge variants effectively</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge>Default</Badge>
                <h4 className="text-sm font-semibold">Primary</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Important status, featured items, primary categories
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <h4 className="text-sm font-semibold">Secondary</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Supporting information, metadata, less prominent labels
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">Outline</Badge>
                <h4 className="text-sm font-semibold">Neutral</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Subtle labels, optional information, inactive states
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="destructive">Destructive</Badge>
                <h4 className="text-sm font-semibold">Critical</h4>
              </div>
              <p className="text-muted-foreground ml-16 text-sm">
                Errors, warnings, urgent status, deprecated items
              </p>
            </div>
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
