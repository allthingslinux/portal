'use client';

import { useState } from 'react';

import { Crown, Shield, User } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface SelectControls {
  placeholder: string;
  disabled: boolean;
  required: boolean;
  withLabel: boolean;
  labelText: string;
  size: 'default' | 'sm' | 'lg';
  withGroups: boolean;
  withSeparators: boolean;
  withIcons: boolean;
  error: boolean;
  helperText: string;
  position: 'popper' | 'item-aligned';
}

const sizeOptions = [
  { value: 'sm', label: 'Small', description: '32px height' },
  { value: 'default', label: 'Default', description: '36px height' },
  { value: 'lg', label: 'Large', description: '40px height' },
] as const;

const positionOptions = [
  { value: 'popper', label: 'Popper', description: 'Floating position' },
  {
    value: 'item-aligned',
    label: 'Item Aligned',
    description: 'Aligned with trigger',
  },
] as const;

// Sample data
const frameworks = [
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'vue', label: 'Vue.js', icon: '💚' },
  { value: 'angular', label: 'Angular', icon: '🅰️' },
  { value: 'svelte', label: 'Svelte', icon: '🧡' },
  { value: 'nextjs', label: 'Next.js', icon: '▲' },
];

const countries = [
  { value: 'us', label: 'United States', icon: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', icon: '🇬🇧' },
  { value: 'ca', label: 'Canada', icon: '🇨🇦' },
  { value: 'au', label: 'Australia', icon: '🇦🇺' },
  { value: 'de', label: 'Germany', icon: '🇩🇪' },
  { value: 'fr', label: 'France', icon: '🇫🇷' },
  { value: 'jp', label: 'Japan', icon: '🇯🇵' },
  { value: 'br', label: 'Brazil', icon: '🇧🇷' },
];

const priorities = [
  { value: 'low', label: 'Low', description: 'Not urgent' },
  { value: 'medium', label: 'Medium', description: 'Standard priority' },
  { value: 'high', label: 'High', description: 'Important' },
  { value: 'urgent', label: 'Urgent', description: 'Critical' },
];

const roles = [
  {
    group: 'System',
    items: [
      { value: 'admin', label: 'Administrator', icon: Crown },
      { value: 'moderator', label: 'Moderator', icon: Shield },
    ],
  },
  {
    group: 'Users',
    items: [
      { value: 'editor', label: 'Editor', icon: User },
      { value: 'viewer', label: 'Viewer', icon: User },
      { value: 'guest', label: 'Guest', icon: User },
    ],
  },
];

export function SelectStory() {
  const { controls, updateControl } = useStoryControls<SelectControls>({
    placeholder: 'Select an option...',
    disabled: false,
    required: false,
    withLabel: false,
    labelText: 'Select Label',
    size: 'default',
    withGroups: false,
    withSeparators: false,
    withIcons: false,
    error: false,
    helperText: '',
    position: 'popper',
  });

  const [selectedValue, setSelectedValue] = useState<string>('');

  const generateCode = () => {
    const triggerProps = {
      className: cn(
        controls.size === 'sm' && 'h-8 text-sm',
        controls.size === 'lg' && 'h-10',
        controls.error && 'border-destructive focus:ring-destructive',
      ),
      disabled: controls.disabled,
      required: controls.required,
    };

    const triggerPropsString = generatePropsString(triggerProps, {
      className: '',
      disabled: false,
      required: false,
    });

    const contentProps = {
      position: controls.position,
    };

    const contentPropsString = generatePropsString(contentProps, {
      position: 'popper',
    });

    let code = '';

    if (controls.withLabel) {
      code += `<div className="space-y-2">\n`;
      code += `  <Label htmlFor="select">${controls.labelText}${controls.required ? ' *' : ''}</Label>\n`;
    }

    const indent = controls.withLabel ? '  ' : '';
    code += `${indent}<Select value={selectedValue} onValueChange={setSelectedValue}>\n`;
    code += `${indent}  <SelectTrigger${triggerPropsString}>\n`;
    code += `${indent}    <SelectValue placeholder="${controls.placeholder}" />\n`;
    code += `${indent}  </SelectTrigger>\n`;
    code += `${indent}  <SelectContent${contentPropsString}>\n`;

    if (controls.withGroups) {
      code += `${indent}    <SelectGroup>\n`;
      code += `${indent}      <SelectLabel>Framework</SelectLabel>\n`;
      code += `${indent}      <SelectItem value="react">React</SelectItem>\n`;
      code += `${indent}      <SelectItem value="vue">Vue.js</SelectItem>\n`;
      code += `${indent}    </SelectGroup>\n`;
      if (controls.withSeparators) {
        code += `${indent}    <SelectSeparator />\n`;
      }
      code += `${indent}    <SelectGroup>\n`;
      code += `${indent}      <SelectLabel>Meta Framework</SelectLabel>\n`;
      code += `${indent}      <SelectItem value="nextjs">Next.js</SelectItem>\n`;
      code += `${indent}      <SelectItem value="nuxt">Nuxt</SelectItem>\n`;
      code += `${indent}    </SelectGroup>\n`;
    } else {
      code += `${indent}    <SelectItem value="react">React</SelectItem>\n`;
      code += `${indent}    <SelectItem value="vue">Vue.js</SelectItem>\n`;
      code += `${indent}    <SelectItem value="angular">Angular</SelectItem>\n`;
      code += `${indent}    <SelectItem value="svelte">Svelte</SelectItem>\n`;
    }

    code += `${indent}  </SelectContent>\n`;
    code += `${indent}</Select>\n`;

    if (controls.helperText) {
      const textColor = controls.error
        ? 'text-destructive'
        : 'text-muted-foreground';
      code += `${indent}<p className="${textColor} text-sm">${controls.helperText}</p>\n`;
    }

    if (controls.withLabel) {
      code += `</div>`;
    }

    return code;
  };

  const renderPreview = () => {
    return (
      <div className="w-full max-w-sm space-y-2">
        {controls.withLabel && (
          <Label htmlFor="select">
            {controls.labelText}
            {controls.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
        )}

        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger
            className={cn(
              controls.size === 'sm' && 'h-8 text-sm',
              controls.size === 'lg' && 'h-10',
              controls.error && 'border-destructive focus:ring-destructive',
            )}
            disabled={controls.disabled}
          >
            <SelectValue placeholder={controls.placeholder} />
          </SelectTrigger>

          <SelectContent position={controls.position}>
            {controls.withGroups ? (
              <>
                <SelectGroup>
                  <SelectLabel>Frontend Frameworks</SelectLabel>
                  {frameworks.slice(0, 3).map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {controls.withIcons && (
                        <span className="mr-2">{framework.icon}</span>
                      )}
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {controls.withSeparators && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel>Meta Frameworks</SelectLabel>
                  {frameworks.slice(3).map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {controls.withIcons && (
                        <span className="mr-2">{framework.icon}</span>
                      )}
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            ) : (
              frameworks.map((framework) => (
                <SelectItem key={framework.value} value={framework.value}>
                  {controls.withIcons && (
                    <span className="mr-2">{framework.icon}</span>
                  )}
                  {framework.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

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

      <div className="space-y-2">
        <Label htmlFor="position">Dropdown Position</Label>
        <SimpleStorySelect
          value={controls.position}
          onValueChange={(value) => updateControl('position', value)}
          options={positionOptions}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder</Label>
        <input
          id="placeholder"
          className="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-2xs focus:ring-1 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          value={controls.placeholder}
          onChange={(e) => updateControl('placeholder', e.target.value)}
          placeholder="Enter placeholder text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="helperText">Helper Text</Label>
        <input
          id="helperText"
          className="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-2xs focus:ring-1 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          value={controls.helperText}
          onChange={(e) => updateControl('helperText', e.target.value)}
          placeholder="Enter helper text"
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="withLabel">With Label</Label>
        <Switch
          id="withLabel"
          checked={controls.withLabel}
          onCheckedChange={(checked) => updateControl('withLabel', checked)}
        />
      </div>

      {controls.withLabel && (
        <div className="space-y-2">
          <Label htmlFor="labelText">Label Text</Label>
          <input
            id="labelText"
            className="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-2xs focus:ring-1 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
            value={controls.labelText}
            onChange={(e) => updateControl('labelText', e.target.value)}
            placeholder="Enter label text"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="withGroups">With Groups</Label>
        <Switch
          id="withGroups"
          checked={controls.withGroups}
          onCheckedChange={(checked) => updateControl('withGroups', checked)}
        />
      </div>

      {controls.withGroups && (
        <div className="flex items-center justify-between">
          <Label htmlFor="withSeparators">With Separators</Label>
          <Switch
            id="withSeparators"
            checked={controls.withSeparators}
            onCheckedChange={(checked) =>
              updateControl('withSeparators', checked)
            }
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="withIcons">With Icons</Label>
        <Switch
          id="withIcons"
          checked={controls.withIcons}
          onCheckedChange={(checked) => updateControl('withIcons', checked)}
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
          <CardTitle>Basic Select</CardTitle>
          <CardDescription>Simple select with various options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basic-select">Choose Framework</Label>
              <Select>
                <SelectTrigger id="basic-select">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue.js</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-select">Priority Level</Label>
              <Select>
                <SelectTrigger id="priority-select">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex flex-col">
                        <span>{priority.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {priority.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grouped Select</CardTitle>
          <CardDescription>
            Select with grouped options and separators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-select">User Role</Label>
              <Select>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleGroup, groupIndex) => (
                    <div key={roleGroup.group}>
                      <SelectGroup>
                        <SelectLabel>{roleGroup.group}</SelectLabel>
                        {roleGroup.items.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      {groupIndex < roles.length - 1 && <SelectSeparator />}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country-select">Country</Label>
              <Select>
                <SelectTrigger id="country-select">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Popular</SelectLabel>
                    {countries.slice(0, 4).map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <span className="mr-2">{country.icon}</span>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Others</SelectLabel>
                    {countries.slice(4).map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <span className="mr-2">{country.icon}</span>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select States</CardTitle>
          <CardDescription>Different states and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="error-select">Error State</Label>
              <Select>
                <SelectTrigger
                  id="error-select"
                  className="border-destructive focus:ring-destructive"
                >
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-destructive text-sm">This field is required</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled-select">Disabled State</Label>
              <Select disabled>
                <SelectTrigger id="disabled-select">
                  <SelectValue placeholder="Cannot select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">Field is disabled</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="small-select">Small Size</Label>
              <Select>
                <SelectTrigger id="small-select" className="h-8 text-sm">
                  <SelectValue placeholder="Small select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small1">Small Option 1</SelectItem>
                  <SelectItem value="small2">Small Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="large-select">Large Size</Label>
              <Select>
                <SelectTrigger id="large-select" className="h-10">
                  <SelectValue placeholder="Large select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="large1">Large Option 1</SelectItem>
                  <SelectItem value="large2">Large Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Select Components</CardTitle>
        <CardDescription>
          Complete API reference for Select components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Select</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Root container for the select component. Contains all other select
              parts.
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
                    <td className="p-3 font-mono text-sm">value</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Current selected value</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">onValueChange</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Callback when value changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">disabled</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Disable the select</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">required</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Make the select required</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">SelectTrigger</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The button that triggers the select dropdown. Shows the selected
              value.
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
                    <td className="p-3 font-mono text-sm">disabled</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Disable the trigger</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">SelectContent</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The dropdown content that contains the selectable items.
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
                  <tr>
                    <td className="p-3 font-mono text-sm">position</td>
                    <td className="p-3 font-mono text-sm">
                      'popper' | 'item-aligned'
                    </td>
                    <td className="p-3 font-mono text-sm">'popper'</td>
                    <td className="p-3">Positioning strategy</td>
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
          <CardTitle>When to Use Select</CardTitle>
          <CardDescription>Best practices for select usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Select For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Choosing one option from many (5+ options)</li>
              <li>• Space-constrained forms</li>
              <li>• Hierarchical or grouped options</li>
              <li>• Options with additional metadata</li>
              <li>• Searchable lists of items</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Select For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Few options (2-4 items - use radio buttons)</li>
              <li>• Binary choices (use switch or checkbox)</li>
              <li>• Multiple selections (use checkbox group)</li>
              <li>• Critical decisions that need to be visible</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>
            Making selects accessible to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              • Space/Enter opens the select
              <br />
              • Arrow keys navigate options
              <br />
              • Escape closes the dropdown
              <br />• Type to search/filter options
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Readers</h4>
            <p className="text-muted-foreground text-sm">
              Use clear labels and provide helpful descriptions. Group related
              options with SelectLabel.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Error Handling</h4>
            <p className="text-muted-foreground text-sm">
              Provide clear error messages and visual indicators when validation
              fails.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Patterns</CardTitle>
          <CardDescription>
            Common select implementation patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Simple Select</h4>
            <p className="text-muted-foreground text-sm">
              Basic selection from a flat list of options. Best for
              straightforward choices.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Grouped Select</h4>
            <p className="text-muted-foreground text-sm">
              Organize related options into groups with labels and optional
              separators.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Rich Options</h4>
            <p className="text-muted-foreground text-sm">
              Include icons, descriptions, or other metadata to help users make
              informed choices.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Searchable Select</h4>
            <p className="text-muted-foreground text-sm">
              For long lists, implement search/filtering to help users find
              options quickly.
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
