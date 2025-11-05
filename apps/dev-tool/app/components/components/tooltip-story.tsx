'use client';

import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Heart,
  HelpCircle,
  Info,
  Settings,
  Share,
  Star,
  User,
} from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Checkbox } from '@portal/ui/checkbox';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@portal/ui/tooltip';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface TooltipControls {
  content: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  alignOffset: number;
  delayDuration: number;
  skipDelayDuration: number;
  disableHoverableContent: boolean;
  withArrow: boolean;
  triggerType: 'button' | 'icon' | 'text' | 'input';
  triggerVariant: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
}

const sideOptions = [
  { value: 'top', label: 'Top', description: 'Show above trigger' },
  { value: 'bottom', label: 'Bottom', description: 'Show below trigger' },
  { value: 'left', label: 'Left', description: 'Show to the left' },
  { value: 'right', label: 'Right', description: 'Show to the right' },
] as const;

const alignOptions = [
  { value: 'start', label: 'Start', description: 'Align to start edge' },
  { value: 'center', label: 'Center', description: 'Align to center' },
  { value: 'end', label: 'End', description: 'Align to end edge' },
] as const;

const triggerTypeOptions = [
  { value: 'button', label: 'Button', description: 'Button trigger' },
  { value: 'icon', label: 'Icon', description: 'Icon button trigger' },
  { value: 'text', label: 'Text', description: 'Text trigger' },
  { value: 'input', label: 'Input', description: 'Input field trigger' },
] as const;

const triggerVariantOptions = [
  { value: 'default', label: 'Default', description: 'Primary style' },
  { value: 'outline', label: 'Outline', description: 'Outlined style' },
  { value: 'ghost', label: 'Ghost', description: 'Minimal style' },
  { value: 'secondary', label: 'Secondary', description: 'Secondary style' },
  { value: 'destructive', label: 'Destructive', description: 'Danger style' },
] as const;

const iconOptions = [
  { value: 'info', icon: Info, label: 'Info' },
  { value: 'help', icon: HelpCircle, label: 'Help' },
  { value: 'alert', icon: AlertCircle, label: 'Alert' },
  { value: 'check', icon: CheckCircle, label: 'Check' },
  { value: 'star', icon: Star, label: 'Star' },
  { value: 'heart', icon: Heart, label: 'Heart' },
  { value: 'settings', icon: Settings, label: 'Settings' },
  { value: 'user', icon: User, label: 'User' },
];

function TooltipStory() {
  const { controls, updateControl } = useStoryControls<TooltipControls>({
    content: 'This is a helpful tooltip',
    side: 'top',
    align: 'center',
    sideOffset: 4,
    alignOffset: 0,
    delayDuration: 700,
    skipDelayDuration: 300,
    disableHoverableContent: false,
    withArrow: false,
    triggerType: 'button',
    triggerVariant: 'outline',
  });

  const [selectedIcon, setSelectedIcon] = useState('info');

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || Info;

  const generateCode = () => {
    const providerProps = {
      delayDuration: controls.delayDuration,
      skipDelayDuration: controls.skipDelayDuration,
      disableHoverableContent: controls.disableHoverableContent,
    };

    const providerPropsString = generatePropsString(providerProps, {
      delayDuration: 700,
      skipDelayDuration: 300,
      disableHoverableContent: false,
    });

    const contentProps = {
      side: controls.side,
      align: controls.align,
      sideOffset: controls.sideOffset,
      alignOffset: controls.alignOffset,
    };

    const contentPropsString = generatePropsString(contentProps, {
      side: 'top',
      align: 'center',
      sideOffset: 4,
      alignOffset: 0,
    });

    let code = `<TooltipProvider${providerPropsString}>\n`;
    code += `  <Tooltip>\n`;
    code += `    <TooltipTrigger asChild>\n`;

    if (controls.triggerType === 'button') {
      code += `      <Button variant="${controls.triggerVariant}">Hover me</Button>\n`;
    } else if (controls.triggerType === 'icon') {
      code += `      <Button variant="${controls.triggerVariant}" size="icon">\n`;
      const iconName = selectedIconData?.icon.name || 'Info';
      code += `        <${iconName} className="h-4 w-4" />\n`;
      code += `      </Button>\n`;
    } else if (controls.triggerType === 'text') {
      code += `      <span className="cursor-help underline decoration-dotted">Hover me</span>\n`;
    } else if (controls.triggerType === 'input') {
      code += `      <Input placeholder="Hover over this input" />\n`;
    }

    code += `    </TooltipTrigger>\n`;
    code += `    <TooltipContent${contentPropsString}>\n`;
    code += `      <p>${controls.content}</p>\n`;
    code += `    </TooltipContent>\n`;
    code += `  </Tooltip>\n`;
    code += `</TooltipProvider>`;

    return code;
  };

  const renderPreview = () => {
    const trigger = (() => {
      switch (controls.triggerType) {
        case 'button':
          return <Button variant={controls.triggerVariant}>Hover me</Button>;
        case 'icon':
          return (
            <Button variant={controls.triggerVariant} size="icon">
              <IconComponent className="h-4 w-4" />
            </Button>
          );
        case 'text':
          return (
            <span className="cursor-help underline decoration-dotted">
              Hover me
            </span>
          );
        case 'input':
          return <Input placeholder="Hover over this input" />;
        default:
          return <Button variant={controls.triggerVariant}>Hover me</Button>;
      }
    })();

    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <TooltipProvider
          delayDuration={controls.delayDuration}
          skipDelayDuration={controls.skipDelayDuration}
          disableHoverableContent={controls.disableHoverableContent}
        >
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent
              side={controls.side}
              align={controls.align}
              sideOffset={controls.sideOffset}
              alignOffset={controls.alignOffset}
            >
              <p>{controls.content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="content">Tooltip Content</Label>
        <Input
          id="content"
          value={controls.content}
          onChange={(e) => updateControl('content', e.target.value)}
          placeholder="Tooltip text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggerType">Trigger Type</Label>
        <SimpleStorySelect
          value={controls.triggerType}
          onValueChange={(value) => updateControl('triggerType', value)}
          options={triggerTypeOptions}
        />
      </div>

      {(controls.triggerType === 'button' ||
        controls.triggerType === 'icon') && (
        <div className="space-y-2">
          <Label htmlFor="triggerVariant">Trigger Style</Label>
          <SimpleStorySelect
            value={controls.triggerVariant}
            onValueChange={(value) => updateControl('triggerVariant', value)}
            options={triggerVariantOptions}
          />
        </div>
      )}

      {controls.triggerType === 'icon' && (
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
      )}

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="side">Position</Label>
        <SimpleStorySelect
          value={controls.side}
          onValueChange={(value) => updateControl('side', value)}
          options={sideOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="align">Alignment</Label>
        <SimpleStorySelect
          value={controls.align}
          onValueChange={(value) => updateControl('align', value)}
          options={alignOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="sideOffset">Side Offset</Label>
          <Input
            id="sideOffset"
            type="number"
            min="0"
            max="50"
            value={controls.sideOffset}
            onChange={(e) =>
              updateControl('sideOffset', parseInt(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alignOffset">Align Offset</Label>
          <Input
            id="alignOffset"
            type="number"
            min="-50"
            max="50"
            value={controls.alignOffset}
            onChange={(e) =>
              updateControl('alignOffset', parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="delayDuration">Delay (ms)</Label>
          <Input
            id="delayDuration"
            type="number"
            min="0"
            max="2000"
            step="100"
            value={controls.delayDuration}
            onChange={(e) =>
              updateControl('delayDuration', parseInt(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skipDelayDuration">Skip Delay (ms)</Label>
          <Input
            id="skipDelayDuration"
            type="number"
            min="0"
            max="1000"
            step="100"
            value={controls.skipDelayDuration}
            onChange={(e) =>
              updateControl('skipDelayDuration', parseInt(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disableHoverableContent">
          Disable Hoverable Content
        </Label>
        <Switch
          id="disableHoverableContent"
          checked={controls.disableHoverableContent}
          onCheckedChange={(checked) =>
            updateControl('disableHoverableContent', checked)
          }
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Tooltips</CardTitle>
          <CardDescription>
            Simple tooltips with different triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TooltipProvider>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="mr-2 h-4 w-4" />
                    Info Button
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This provides additional information</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click for help documentation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help underline decoration-dotted">
                    Hover for explanation
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This term needs clarification for better understanding</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Input placeholder="Hover me" className="w-48" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your email address here</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tooltip Positions</CardTitle>
          <CardDescription>Different positioning options</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="grid grid-cols-3 gap-8">
                {/* Top Row */}
                <div></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Top
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Tooltip on top</p>
                  </TooltipContent>
                </Tooltip>
                <div></div>

                {/* Middle Row */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Left
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Tooltip on left</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Center</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Right
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Tooltip on right</p>
                  </TooltipContent>
                </Tooltip>

                {/* Bottom Row */}
                <div></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bottom
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Tooltip on bottom</p>
                  </TooltipContent>
                </Tooltip>
                <div></div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rich Content Tooltips</CardTitle>
          <CardDescription>Tooltips with more complex content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TooltipProvider>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Premium Feature
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">Premium Feature</p>
                    <p className="text-xs">
                      This feature is only available to premium subscribers.
                      Upgrade your plan to unlock this functionality.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Advanced Settings
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">Keyboard Shortcut</p>
                    <p className="text-xs">
                      Press{' '}
                      <kbd className="bg-muted rounded px-1 py-0.5 text-xs">
                        Ctrl+Shift+S
                      </kbd>{' '}
                      to open
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-destructive bg-destructive text-destructive-foreground max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">⚠️ Destructive Action</p>
                    <p className="text-xs">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>Tooltips on various UI elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TooltipProvider>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download file</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share with others</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input id="username" placeholder="Enter username" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Must be 3-20 characters, letters and numbers only</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox id="terms" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        By checking this, you agree to our Terms of Service and
                        Privacy Policy
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the terms and conditions
                  </Label>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tooltip Components</CardTitle>
        <CardDescription>
          Complete API reference for Tooltip components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">TooltipProvider</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Provides context for tooltip behavior. Wrap your app or section
              using tooltips.
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
                    <td className="p-3 font-mono text-sm">delayDuration</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">700</td>
                    <td className="p-3">Delay before tooltip appears (ms)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">skipDelayDuration</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">300</td>
                    <td className="p-3">
                      Delay to skip when moving between tooltips (ms)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">
                      disableHoverableContent
                    </td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">
                      Prevent tooltip from being hoverable
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">TooltipContent</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The content area of the tooltip with positioning options.
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
                    <td className="p-3 font-mono text-sm">side</td>
                    <td className="p-3 font-mono text-sm">
                      'top' | 'bottom' | 'left' | 'right'
                    </td>
                    <td className="p-3 font-mono text-sm">'top'</td>
                    <td className="p-3">Position relative to trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">align</td>
                    <td className="p-3 font-mono text-sm">
                      'start' | 'center' | 'end'
                    </td>
                    <td className="p-3 font-mono text-sm">'center'</td>
                    <td className="p-3">Alignment relative to trigger</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">sideOffset</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">4</td>
                    <td className="p-3">Distance from trigger (px)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">alignOffset</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">0</td>
                    <td className="p-3">Alignment offset (px)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">Other Components</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Tooltip:</strong> Root container for tooltip state
              </li>
              <li>
                <strong>TooltipTrigger:</strong> Element that triggers the
                tooltip (use asChild prop)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>When to Use Tooltips</CardTitle>
          <CardDescription>Best practices for tooltip usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Tooltips For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Icon buttons and controls that need clarification</li>
              <li>
                • Form fields with formatting requirements or validation rules
              </li>
              <li>• Abbreviated text or truncated content</li>
              <li>• Keyboard shortcuts and accessibility information</li>
              <li>• Additional context that doesn't fit in the UI</li>
              <li>• Help text for complex or unfamiliar features</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Tooltips For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Essential information users need to complete tasks</li>
              <li>
                • Long explanations (use dialogs or dedicated help sections)
              </li>
              <li>• Interactive content (tooltips dismiss on focus loss)</li>
              <li>• Mobile interfaces (hover behavior is unreliable)</li>
              <li>• Information that's already visible in the interface</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
          <CardDescription>Writing effective tooltip content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Content Best Practices</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Keep content concise (ideally 1-2 lines)</li>
              <li>• Use sentence case, not title case</li>
              <li>• Don't repeat what's already visible</li>
              <li>• Be specific and actionable</li>
              <li>• Use active voice when possible</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Examples</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm">
                  ❌ <span className="text-destructive">Bad:</span> "Click this
                  button"
                </p>
                <p className="text-sm">
                  ✅ <span className="text-green-600">Good:</span> "Save your
                  changes"
                </p>
              </div>
              <div>
                <p className="text-sm">
                  ❌ <span className="text-destructive">Bad:</span> "This field
                  is for your password"
                </p>
                <p className="text-sm">
                  ✅ <span className="text-green-600">Good:</span> "Must be 8+
                  characters with one number"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>
            Making tooltips accessible to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Support</h4>
            <p className="text-muted-foreground text-sm">
              • Tooltips appear on focus and disappear on blur
              <br />
              • Escape key dismisses tooltips
              <br />• Tooltips don't trap focus or interfere with navigation
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Reader Support</h4>
            <p className="text-muted-foreground text-sm">
              Tooltips are announced to screen readers when their trigger
              elements receive focus. Essential information should not rely
              solely on tooltips.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Mobile Considerations</h4>
            <p className="text-muted-foreground text-sm">
              Tooltips may not work reliably on touch devices. Consider
              alternative approaches like expandable sections or inline help
              text for mobile interfaces.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Patterns</CardTitle>
          <CardDescription>
            Typical tooltip implementation scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Icon Button Tooltips</h4>
            <p className="text-muted-foreground text-sm">
              Always provide tooltips for icon-only buttons to clarify their
              function.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Form Field Help</h4>
            <p className="text-muted-foreground text-sm">
              Use tooltips to provide format requirements, examples, or
              validation rules.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Status Indicators</h4>
            <p className="text-muted-foreground text-sm">
              Explain status badges, progress indicators, or system states.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Truncated Content</h4>
            <p className="text-muted-foreground text-sm">
              Show full content when text is truncated due to space constraints.
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
export default TooltipStory;
