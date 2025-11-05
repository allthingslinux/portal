'use client';

import { useState } from 'react';

import {
  Bell,
  Eye,
  Lock,
  Mail,
  Moon,
  Shield,
  Volume2,
  Wifi,
} from 'lucide-react';

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

interface SwitchControls {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  withLabel: boolean;
  labelText: string;
  labelPosition: 'left' | 'right' | 'top' | 'bottom';
  withDescription: boolean;
  description: string;
  withIcon: boolean;
  size: 'default' | 'sm' | 'lg';
  error: boolean;
  helperText: string;
}

const sizeOptions = [
  { value: 'sm', label: 'Small', description: '16px height' },
  { value: 'default', label: 'Default', description: '20px height' },
  { value: 'lg', label: 'Large', description: '24px height' },
] as const;

const labelPositionOptions = [
  { value: 'left', label: 'Left', description: 'Label on the left' },
  { value: 'right', label: 'Right', description: 'Label on the right' },
  { value: 'top', label: 'Top', description: 'Label above switch' },
  { value: 'bottom', label: 'Bottom', description: 'Label below switch' },
] as const;

const iconOptions = [
  { value: 'bell', icon: Bell, label: 'Bell' },
  { value: 'mail', icon: Mail, label: 'Mail' },
  { value: 'shield', icon: Shield, label: 'Shield' },
  { value: 'moon', icon: Moon, label: 'Moon' },
  { value: 'wifi', icon: Wifi, label: 'Wifi' },
  { value: 'volume', icon: Volume2, label: 'Volume' },
  { value: 'eye', icon: Eye, label: 'Eye' },
  { value: 'lock', icon: Lock, label: 'Lock' },
];

export function SwitchStory() {
  const { controls, updateControl } = useStoryControls<SwitchControls>({
    checked: false,
    disabled: false,
    required: false,
    withLabel: false,
    labelText: 'Enable notifications',
    labelPosition: 'right',
    withDescription: false,
    description: 'Receive push notifications on your device',
    withIcon: false,
    size: 'default',
    error: false,
    helperText: '',
  });

  const [selectedIcon, setSelectedIcon] = useState('bell');

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || Bell;

  const generateCode = () => {
    const switchProps = {
      checked: controls.checked,
      disabled: controls.disabled,
      required: controls.required,
      className: cn(
        controls.size === 'sm' && 'h-4 w-7',
        controls.size === 'lg' && 'h-6 w-11',
        controls.error && 'data-[state=checked]:bg-destructive',
      ),
    };

    const switchPropsString = generatePropsString(switchProps, {
      checked: false,
      disabled: false,
      required: false,
      className: '',
    });

    let code = '';

    if (controls.withLabel) {
      const isVertical =
        controls.labelPosition === 'top' || controls.labelPosition === 'bottom';
      const containerClass = isVertical
        ? 'space-y-2'
        : 'flex items-center space-x-3';

      if (controls.labelPosition === 'top') {
        containerClass.replace('space-y-2', 'space-y-2');
      } else if (controls.labelPosition === 'bottom') {
        containerClass.replace(
          'space-y-2',
          'flex flex-col-reverse space-y-2 space-y-reverse',
        );
      } else if (controls.labelPosition === 'left') {
        containerClass.replace(
          'space-x-3',
          'flex-row-reverse space-x-3 space-x-reverse',
        );
      }

      code += `<div className="${containerClass}">\n`;

      if (
        controls.labelPosition === 'top' ||
        controls.labelPosition === 'left'
      ) {
        code += `  <div className="space-y-1">\n`;
        code += `    <Label htmlFor="switch" className="${controls.labelPosition === 'left' ? 'text-sm font-medium' : ''}">\n`;
        if (controls.withIcon) {
          const iconName = selectedIconData?.icon.name || 'Bell';
          code += `      <${iconName} className="mr-2 h-4 w-4 inline" />\n`;
        }
        code += `      ${controls.labelText}${controls.required ? ' *' : ''}\n`;
        code += `    </Label>\n`;
        if (controls.withDescription) {
          code += `    <p className="text-muted-foreground text-sm">${controls.description}</p>\n`;
        }
        code += `  </div>\n`;
      }

      code += `  <Switch${switchPropsString} />\n`;

      if (
        controls.labelPosition === 'right' ||
        controls.labelPosition === 'bottom'
      ) {
        code += `  <div className="space-y-1">\n`;
        code += `    <Label htmlFor="switch" className="${controls.labelPosition === 'right' ? 'text-sm font-medium' : ''}">\n`;
        if (controls.withIcon) {
          const iconName = selectedIconData?.icon.name || 'Bell';
          code += `      <${iconName} className="mr-2 h-4 w-4 inline" />\n`;
        }
        code += `      ${controls.labelText}${controls.required ? ' *' : ''}\n`;
        code += `    </Label>\n`;
        if (controls.withDescription) {
          code += `    <p className="text-muted-foreground text-sm">${controls.description}</p>\n`;
        }
        code += `  </div>\n`;
      }

      code += `</div>`;
    } else {
      code += `<Switch${switchPropsString} />`;
    }

    if (controls.helperText) {
      const indent = controls.withLabel ? '' : '';
      const textColor = controls.error
        ? 'text-destructive'
        : 'text-muted-foreground';
      code += `\n${indent}<p className="${textColor} text-sm">${controls.helperText}</p>`;
    }

    return code;
  };

  const renderPreview = () => {
    const switchElement = (
      <Switch
        checked={controls.checked}
        onCheckedChange={(checked) => updateControl('checked', checked)}
        disabled={controls.disabled}
        id="switch"
        className={cn(
          controls.size === 'sm' && 'h-4 w-7',
          controls.size === 'lg' && 'h-6 w-11',
          controls.error && 'data-[state=checked]:bg-destructive',
        )}
      />
    );

    const labelElement = controls.withLabel && (
      <div className="space-y-1">
        <Label
          htmlFor="switch"
          className={cn(
            controls.labelPosition === 'left' ||
              controls.labelPosition === 'right'
              ? 'text-sm font-medium'
              : '',
          )}
        >
          {controls.withIcon && (
            <IconComponent className="mr-2 inline h-4 w-4" />
          )}
          {controls.labelText}
          {controls.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        {controls.withDescription && (
          <p className="text-muted-foreground text-sm">
            {controls.description}
          </p>
        )}
      </div>
    );

    if (!controls.withLabel) {
      return (
        <div className="space-y-2">
          {switchElement}
          {controls.helperText && (
            <p
              className={cn(
                'text-sm',
                controls.error ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {controls.helperText}
            </p>
          )}
        </div>
      );
    }

    const isVertical =
      controls.labelPosition === 'top' || controls.labelPosition === 'bottom';
    const containerClass = cn(
      isVertical ? 'space-y-2' : 'flex items-center space-x-3',
      controls.labelPosition === 'bottom' && 'flex-col-reverse space-y-reverse',
      controls.labelPosition === 'left' && 'flex-row-reverse space-x-reverse',
    );

    return (
      <div className="space-y-2">
        <div className={containerClass}>
          {(controls.labelPosition === 'top' ||
            controls.labelPosition === 'left') &&
            labelElement}
          {switchElement}
          {(controls.labelPosition === 'right' ||
            controls.labelPosition === 'bottom') &&
            labelElement}
        </div>
        {controls.helperText && (
          <p
            className={cn(
              'text-sm',
              controls.error ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {controls.helperText}
          </p>
        )}
      </div>
    );
  };

  const renderControls = () => (
    <>
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
        <Label htmlFor="checked">Checked State</Label>
        <Switch
          id="checked"
          checked={controls.checked}
          onCheckedChange={(checked) => updateControl('checked', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="withLabel">With Label</Label>
        <Switch
          id="withLabel"
          checked={controls.withLabel}
          onCheckedChange={(checked) => updateControl('withLabel', checked)}
        />
      </div>

      {controls.withLabel && (
        <>
          <div className="space-y-2">
            <Label htmlFor="labelText">Label Text</Label>
            <Input
              id="labelText"
              value={controls.labelText}
              onChange={(e) => updateControl('labelText', e.target.value)}
              placeholder="Enter label text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labelPosition">Label Position</Label>
            <SimpleStorySelect
              value={controls.labelPosition}
              onValueChange={(value) => updateControl('labelPosition', value)}
              options={labelPositionOptions}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="withDescription">With Description</Label>
            <Switch
              id="withDescription"
              checked={controls.withDescription}
              onCheckedChange={(checked) =>
                updateControl('withDescription', checked)
              }
            />
          </div>

          {controls.withDescription && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={controls.description}
                onChange={(e) => updateControl('description', e.target.value)}
                placeholder="Enter description text"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="withIcon">With Icon</Label>
            <Switch
              id="withIcon"
              checked={controls.withIcon}
              onCheckedChange={(checked) => updateControl('withIcon', checked)}
            />
          </div>

          {controls.withIcon && (
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
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="helperText">Helper Text</Label>
        <Input
          id="helperText"
          value={controls.helperText}
          onChange={(e) => updateControl('helperText', e.target.value)}
          placeholder="Enter helper text"
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="required">Required</Label>
        <Switch
          id="required"
          checked={controls.required}
          onCheckedChange={(checked) => updateControl('required', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disabled">Disabled</Label>
        <Switch
          id="disabled"
          checked={controls.disabled}
          onCheckedChange={(checked) => updateControl('disabled', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="error">Error State</Label>
        <Switch
          id="error"
          checked={controls.error}
          onCheckedChange={(checked) => updateControl('error', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Switches</CardTitle>
          <CardDescription>Simple on/off toggles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3">
              <Switch id="basic-1" />
              <Label htmlFor="basic-1">Default switch</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch id="basic-2" defaultChecked />
              <Label htmlFor="basic-2">Checked by default</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch id="basic-3" disabled />
              <Label htmlFor="basic-3">Disabled switch</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch id="basic-4" disabled defaultChecked />
              <Label htmlFor="basic-4">Disabled & checked</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch Sizes</CardTitle>
          <CardDescription>
            Different sizes for various contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch className="h-4 w-7" />
              <Label className="text-sm">Small</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch />
              <Label className="text-sm">Default</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch className="h-6 w-11" />
              <Label className="text-sm">Large</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Label Positions</CardTitle>
          <CardDescription>Different label arrangements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Label on top</Label>
              <Switch />
            </div>

            <div className="flex flex-col-reverse space-y-2 space-y-reverse">
              <Label>Label on bottom</Label>
              <Switch />
            </div>

            <div className="flex items-center space-x-3">
              <Switch />
              <Label>Label on right</Label>
            </div>

            <div className="flex flex-row-reverse items-center space-x-3 space-x-reverse">
              <Switch />
              <Label>Label on left</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings Panel</CardTitle>
          <CardDescription>Real-world usage example</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center text-sm font-medium">
                  <Bell className="mr-2 h-4 w-4" />
                  Push Notifications
                </Label>
                <p className="text-muted-foreground text-sm">
                  Get notified about important updates
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center text-sm font-medium">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-muted-foreground text-sm">
                  Receive updates via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center text-sm font-medium">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </Label>
                <p className="text-muted-foreground text-sm">
                  Switch to dark theme
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center text-sm font-medium">
                  <Shield className="mr-2 h-4 w-4" />
                  Two-Factor Authentication
                </Label>
                <p className="text-muted-foreground text-sm">
                  Add an extra layer of security
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Integration</CardTitle>
          <CardDescription>Switches in forms with validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="terms">
                  Accept Terms & Conditions
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Switch id="terms" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing">Subscribe to marketing emails</Label>
                <Switch id="marketing" defaultChecked />
              </div>
              <p className="text-muted-foreground text-sm">
                You can unsubscribe at any time
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="error-switch">
                  Enable feature (error state)
                </Label>
                <Switch
                  id="error-switch"
                  className="data-[state=checked]:bg-destructive"
                />
              </div>
              <p className="text-destructive text-sm">
                This feature is currently unavailable
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Switch Component</CardTitle>
        <CardDescription>
          Complete API reference for Switch component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Switch</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A toggle switch component for boolean states. Built on Radix UI
              Switch primitive.
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
                    <td className="p-3 font-mono text-sm">checked</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Controlled checked state</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">defaultChecked</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">
                      Default checked state (uncontrolled)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">onCheckedChange</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Callback when checked state changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">disabled</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Disable the switch</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">required</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Make the switch required</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">name</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Name attribute for form submission</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">value</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">'on'</td>
                    <td className="p-3">
                      Value for form submission when checked
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">id</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">HTML id attribute</td>
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
          <CardTitle>When to Use Switch</CardTitle>
          <CardDescription>Best practices for switch usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Switch For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Binary on/off states (enable/disable features)</li>
              <li>• Settings and preferences</li>
              <li>• Immediate state changes with visible effect</li>
              <li>• Mobile-friendly toggle controls</li>
              <li>• When space is limited</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Switch For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Multiple choice selections (use radio buttons)</li>
              <li>• Actions that require confirmation</li>
              <li>• States that need to be submitted in a form</li>
              <li>• When the change isn't immediate or obvious</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch vs Checkbox</CardTitle>
          <CardDescription>When to use each component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Use Switch When</h4>
              <ul className="space-y-1 text-sm">
                <li>• Changes take effect immediately</li>
                <li>• Controlling system settings</li>
                <li>• Mobile interfaces</li>
                <li>• Binary state is obvious</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Use Checkbox When</h4>
              <ul className="space-y-1 text-sm">
                <li>• Part of a form submission</li>
                <li>• Multiple selections allowed</li>
                <li>• Requires explicit confirmation</li>
                <li>• Agreement/consent scenarios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>
            Making switches accessible to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              • Tab to focus the switch
              <br />
              • Space or Enter to toggle state
              <br />• Arrow keys when part of a radio group
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Reader Support</h4>
            <p className="text-muted-foreground text-sm">
              Always provide clear labels and descriptions. Use ARIA attributes
              appropriately.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Visual Design</h4>
            <p className="text-muted-foreground text-sm">
              Ensure sufficient color contrast and provide visual feedback for
              all states.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Patterns</CardTitle>
          <CardDescription>
            Typical switch implementation patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Settings Panel</h4>
            <p className="text-muted-foreground text-sm">
              Group related switches with descriptive labels and help text.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Feature Toggles</h4>
            <p className="text-muted-foreground text-sm">
              Enable/disable application features with immediate visual
              feedback.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Permission Controls</h4>
            <p className="text-muted-foreground text-sm">
              Control user permissions and privacy settings with clear labeling.
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
