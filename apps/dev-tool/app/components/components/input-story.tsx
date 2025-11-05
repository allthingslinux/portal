'use client';

import { useState } from 'react';

import {
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Search,
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
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface InputControls {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local';
  placeholder: string;
  disabled: boolean;
  required: boolean;
  withLabel: boolean;
  labelText: string;
  withIcon: boolean;
  iconPosition: 'left' | 'right';
  // size: 'default' | 'sm' | 'lg'; // Size variants not implemented in component
  error: boolean;
  helperText: string;
  maxLength?: number;
}

const typeOptions = [
  { value: 'text', label: 'Text', description: 'Plain text input' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  {
    value: 'password',
    label: 'Password',
    description: 'Password input (hidden)',
  },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'tel', label: 'Phone', description: 'Phone number input' },
  { value: 'url', label: 'URL', description: 'Website URL input' },
  { value: 'search', label: 'Search', description: 'Search query input' },
  { value: 'date', label: 'Date', description: 'Date picker input' },
  { value: 'time', label: 'Time', description: 'Time picker input' },
  {
    value: 'datetime-local',
    label: 'DateTime',
    description: 'Date and time input',
  },
] as const;

const iconOptions = [
  { value: 'user', icon: User, label: 'User' },
  { value: 'mail', icon: Mail, label: 'Mail' },
  { value: 'lock', icon: Lock, label: 'Lock' },
  { value: 'search', icon: Search, label: 'Search' },
  { value: 'calendar', icon: Calendar, label: 'Calendar' },
  { value: 'phone', icon: Phone, label: 'Phone' },
  { value: 'card', icon: CreditCard, label: 'Credit Card' },
];

export function InputStory() {
  const { controls, updateControl } = useStoryControls<InputControls>({
    type: 'text',
    placeholder: 'Enter text...',
    disabled: false,
    required: false,
    withLabel: false,
    labelText: 'Input Label',
    withIcon: false,
    iconPosition: 'left',
    // size: 'default', // removed - not implemented
    error: false,
    helperText: '',
    maxLength: undefined,
  });

  const [selectedIcon, setSelectedIcon] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || User;

  const generateCode = () => {
    const isPasswordWithToggle =
      controls.type === 'password' && controls.withIcon;

    const inputProps = {
      type: isPasswordWithToggle && showPassword ? 'text' : controls.type,
      placeholder: controls.placeholder,
      disabled: controls.disabled,
      required: controls.required,
      maxLength: controls.maxLength,
      className: cn(
        controls.withIcon && controls.iconPosition === 'left' && 'pl-9',
        controls.withIcon && controls.iconPosition === 'right' && 'pr-9',
        controls.error && 'border-destructive focus-visible:ring-destructive',
      ),
    };

    const propsString = generatePropsString(inputProps, {
      type: 'text',
      placeholder: '',
      disabled: false,
      required: false,
      maxLength: undefined,
      className: '',
    });

    let code = '';

    if (controls.withLabel) {
      code += `<div className="space-y-2">\n`;
      code += `  <Label htmlFor="input">${controls.labelText}${controls.required ? ' *' : ''}</Label>\n`;
    }

    if (controls.withIcon) {
      code += `  <div className="relative">\n`;

      if (controls.iconPosition === 'left') {
        const iconName = selectedIconData?.icon.name || 'User';
        code += `    <${iconName} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />\n`;
      }

      code += `    <Input${propsString} />\n`;

      if (controls.type === 'password' && controls.iconPosition === 'right') {
        code += `    <Button\n`;
        code += `      type="button"\n`;
        code += `      variant="ghost"\n`;
        code += `      size="sm"\n`;
        code += `      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"\n`;
        code += `      onClick={() => setShowPassword(!showPassword)}\n`;
        code += `    >\n`;
        code += `      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}\n`;
        code += `    </Button>\n`;
      } else if (controls.iconPosition === 'right') {
        const iconName = selectedIconData?.icon.name || 'User';
        code += `    <${iconName} className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />\n`;
      }

      code += `  </div>\n`;
    } else {
      const indent = controls.withLabel ? '  ' : '';
      code += `${indent}<Input${propsString} />\n`;
    }

    if (controls.helperText) {
      const indent = controls.withLabel ? '  ' : '';
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
    const isPasswordWithToggle =
      controls.type === 'password' && controls.withIcon;

    const inputElement = (
      <div className="relative">
        {controls.withIcon && controls.iconPosition === 'left' && (
          <IconComponent className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}

        <Input
          type={isPasswordWithToggle && showPassword ? 'text' : controls.type}
          placeholder={controls.placeholder}
          disabled={controls.disabled}
          required={controls.required}
          maxLength={controls.maxLength}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={cn(
            controls.size === 'sm' && 'h-8 text-sm',
            controls.size === 'lg' && 'h-10',
            controls.withIcon && controls.iconPosition === 'left' && 'pl-9',
            controls.withIcon && controls.iconPosition === 'right' && 'pr-9',
            controls.error &&
              'border-destructive focus-visible:ring-destructive',
          )}
        />

        {controls.withIcon &&
          controls.iconPosition === 'right' &&
          (controls.type === 'password' ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <IconComponent className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
          ))}
      </div>
    );

    return (
      <div className="w-full max-w-sm space-y-2">
        {controls.withLabel && (
          <Label htmlFor="input">
            {controls.labelText}
            {controls.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
        )}
        {inputElement}
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
        <Label htmlFor="type">Input Type</Label>
        <SimpleStorySelect
          value={controls.type}
          onValueChange={(value) => updateControl('type', value)}
          options={typeOptions}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder</Label>
        <Input
          id="placeholder"
          value={controls.placeholder}
          onChange={(e) => updateControl('placeholder', e.target.value)}
          placeholder="Enter placeholder text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="helperText">Helper Text</Label>
        <Input
          id="helperText"
          value={controls.helperText}
          onChange={(e) => updateControl('helperText', e.target.value)}
          placeholder="Enter helper text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxLength">Max Length</Label>
        <Input
          id="maxLength"
          type="number"
          value={controls.maxLength || ''}
          onChange={(e) =>
            updateControl(
              'maxLength',
              e.target.value ? parseInt(e.target.value) : undefined,
            )
          }
          placeholder="No limit"
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
          <Input
            id="labelText"
            value={controls.labelText}
            onChange={(e) => updateControl('labelText', e.target.value)}
            placeholder="Enter label text"
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
          <CardTitle>Input Types</CardTitle>
          <CardDescription>
            Different input types for various data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Input</Label>
              <Input id="text-input" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-input">Email Input</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-input">Password Input</Label>
              <Input
                id="password-input"
                type="password"
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number-input">Number Input</Label>
              <Input
                id="number-input"
                type="number"
                placeholder="Enter a number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input with Icons</CardTitle>
          <CardDescription>
            Enhanced inputs with icon indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-input">Username</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="user-input"
                  className="pl-9"
                  placeholder="Username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-input">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search-input"
                  className="pl-9"
                  placeholder="Search..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-icon-input">Email with Icon</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="email-icon-input"
                  type="email"
                  className="pl-9"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-input">Phone Number</Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="phone-input"
                  type="tel"
                  className="pl-9"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input States</CardTitle>
          <CardDescription>Different input states and feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="success-input">Success State</Label>
              <Input
                id="success-input"
                placeholder="Valid input"
                className="border-green-500 focus-visible:ring-green-500"
              />
              <p className="text-sm text-green-600">Looks good!</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-input">Error State</Label>
              <Input
                id="error-input"
                placeholder="Invalid input"
                className="border-destructive focus-visible:ring-destructive"
              />
              <p className="text-destructive text-sm">This field is required</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled State</Label>
              <Input id="disabled-input" placeholder="Cannot edit" disabled />
              <p className="text-muted-foreground text-sm">Field is disabled</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="readonly-input">Read-only</Label>
              <Input
                id="readonly-input"
                value="Read-only value"
                readOnly
                className="bg-muted"
              />
              <p className="text-muted-foreground text-sm">
                Value cannot be changed
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
        <CardTitle>Input Component</CardTitle>
        <CardDescription>
          Complete API reference for Input component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Input</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A form input element for collecting user data with various types
              and states.
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
                    <td className="p-3 font-mono text-sm">type</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">'text'</td>
                    <td className="p-3">
                      HTML input type (text, email, password, etc.)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">placeholder</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Placeholder text when empty</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">disabled</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Disable the input</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">required</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Make the input required</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">readOnly</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Make the input read-only</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">maxLength</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Maximum character length</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">value</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Controlled input value</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">onChange</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Change event handler</td>
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
          <CardTitle>When to Use Inputs</CardTitle>
          <CardDescription>Best practices for input usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Inputs For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Single-line text entry (names, emails, passwords)</li>
              <li>• Numeric values (ages, prices, quantities)</li>
              <li>• Dates and times</li>
              <li>• Search queries</li>
              <li>• Form data collection</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Inputs For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Multi-line text (use textarea instead)</li>
              <li>• Multiple selections (use select or checkboxes)</li>
              <li>• Binary choices (use switches or radio buttons)</li>
              <li>• File uploads (use file input type)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>
            Making inputs accessible to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Labels and Descriptions</h4>
            <p className="text-muted-foreground text-sm">
              Always provide clear labels and helper text. Use required
              indicators for mandatory fields.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Error Handling</h4>
            <p className="text-muted-foreground text-sm">
              Provide clear error messages that explain what went wrong and how
              to fix it.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              Ensure inputs are keyboard accessible and follow logical tab
              order.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input Types Guide</CardTitle>
          <CardDescription>Choosing the right input type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Text Types</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <code>text</code> - General text input
                </li>
                <li>
                  <code>email</code> - Email addresses
                </li>
                <li>
                  <code>password</code> - Sensitive text
                </li>
                <li>
                  <code>url</code> - Website addresses
                </li>
                <li>
                  <code>tel</code> - Phone numbers
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Specialized Types</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <code>number</code> - Numeric values
                </li>
                <li>
                  <code>date</code> - Date selection
                </li>
                <li>
                  <code>time</code> - Time selection
                </li>
                <li>
                  <code>search</code> - Search queries
                </li>
                <li>
                  <code>file</code> - File uploads
                </li>
              </ul>
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
