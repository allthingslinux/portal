'use client';

import { useState } from 'react';

import {
  CreditCardIcon,
  PlaneIcon,
  SmartphoneIcon,
  TruckIcon,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '@portal/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';

import {
  generateImportStatement,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface RadioGroupStoryControls {
  orientation: 'vertical' | 'horizontal';
  disabled: boolean;
  useLabels: boolean;
  showValue: boolean;
  size: 'sm' | 'md' | 'lg';
}

const paymentMethods = [
  {
    value: 'card',
    label: 'Credit Card',
    icon: CreditCardIcon,
    description: 'Pay with your credit or debit card',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    icon: CreditCardIcon,
    description: 'Direct bank transfer',
  },
  {
    value: 'mobile',
    label: 'Mobile Payment',
    icon: SmartphoneIcon,
    description: 'Pay with mobile wallet',
  },
];

const shippingOptions = [
  {
    value: 'standard',
    label: 'Standard Shipping',
    icon: TruckIcon,
    description: '5-7 business days',
    price: 'Free',
  },
  {
    value: 'express',
    label: 'Express Shipping',
    icon: TruckIcon,
    description: '2-3 business days',
    price: '$9.99',
  },
  {
    value: 'overnight',
    label: 'Overnight Shipping',
    icon: PlaneIcon,
    description: '1 business day',
    price: '$19.99',
  },
];

export default function RadioGroupStory() {
  const { controls, updateControl } = useStoryControls<RadioGroupStoryControls>(
    {
      orientation: 'vertical',
      disabled: false,
      useLabels: false,
      showValue: true,
      size: 'md',
    },
  );

  const [selectedValue, setSelectedValue] = useState<string>('');

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        value: selectedValue || 'option1',
        onValueChange: 'setValue',
        disabled: controls.disabled,
        className:
          controls.orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2',
      },
      {
        disabled: false,
      },
    );

    const imports = generateImportStatement(
      controls.useLabels
        ? ['RadioGroup', 'RadioGroupItem', 'RadioGroupItemLabel']
        : ['RadioGroup', 'RadioGroupItem'],
      '@portal/ui/radio-group',
    );

    const labelImport = controls.useLabels
      ? ''
      : `\nimport { Label } from '@portal/ui/label';`;

    const itemsCode = controls.useLabels
      ? `  {paymentMethods.map((method) => (
    <RadioGroupItemLabel
      key={method.value}
      selected={selectedValue === method.value}
    >
      <RadioGroupItem value={method.value} />
      <div className="flex items-center gap-3">
        <method.icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{method.label}</p>
          <p className="text-sm text-muted-foreground">
            {method.description}
          </p>
        </div>
      </div>
    </RadioGroupItemLabel>
  ))}`
      : `  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option3" id="option3" />
    <Label htmlFor="option3">Option 3</Label>
  </div>`;

    return `${imports}${labelImport}\n\nfunction PaymentForm() {\n  const [selectedValue, setSelectedValue] = useState('${selectedValue || 'option1'}');\n\n  return (\n    <RadioGroup${propsString}>\n${itemsCode}\n    </RadioGroup>\n  );\n}`;
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Radio Group Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Orientation
            </label>
            <Select
              value={controls.orientation}
              onValueChange={(value: RadioGroupStoryControls['orientation']) =>
                updateControl('orientation', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Size</label>
            <Select
              value={controls.size}
              onValueChange={(value: RadioGroupStoryControls['size']) =>
                updateControl('size', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="disabled"
              checked={controls.disabled}
              onCheckedChange={(checked) => updateControl('disabled', checked)}
            />
            <label htmlFor="disabled" className="text-sm">
              Disabled
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="useLabels"
              checked={controls.useLabels}
              onCheckedChange={(checked) => updateControl('useLabels', checked)}
            />
            <label htmlFor="useLabels" className="text-sm">
              Enhanced Labels
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showValue"
              checked={controls.showValue}
              onCheckedChange={(checked) => updateControl('showValue', checked)}
            />
            <label htmlFor="showValue" className="text-sm">
              Show Selected Value
            </label>
          </div>
        </div>

        {controls.showValue && selectedValue && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="mb-1 text-sm font-medium">Selected Value:</p>
            <p className="font-mono text-sm">{selectedValue}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>Radio Group Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block text-base font-semibold">
              Choose your preferred option:
            </Label>

            <RadioGroup
              value={selectedValue}
              onValueChange={setSelectedValue}
              disabled={controls.disabled}
              className={
                controls.orientation === 'horizontal'
                  ? 'flex flex-wrap gap-4'
                  : 'space-y-2'
              }
            >
              {controls.useLabels
                ? paymentMethods.slice(0, 3).map((method) => (
                    <RadioGroupItemLabel
                      key={method.value}
                      selected={selectedValue === method.value}
                    >
                      <RadioGroupItem
                        value={method.value}
                        className={sizeClasses[controls.size]}
                      />
                      <div className="flex items-center gap-3">
                        <method.icon className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-muted-foreground text-sm">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </RadioGroupItemLabel>
                  ))
                : ['Option 1', 'Option 2', 'Option 3'].map((option, index) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={`option-${index + 1}`}
                        className={sizeClasses[controls.size]}
                      />
                      <Label htmlFor={`option-${index + 1}`}>{option}</Label>
                    </div>
                  ))}
            </RadioGroup>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedValue('')}
              variant="outline"
              size="sm"
              disabled={controls.disabled || !selectedValue}
            >
              Clear Selection
            </Button>

            <Button disabled={controls.disabled || !selectedValue} size="sm">
              Confirm Choice
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      generatedCode={generateCode()}
      previewTitle="Interactive Radio Group"
      previewDescription="Single-selection input control with customizable styling and layouts"
      controlsTitle="Configuration"
      controlsDescription="Adjust orientation, size, labels, and behavior"
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Radio Groups</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="option2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="simple1" />
                      <Label htmlFor="simple1">Option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="simple2" />
                      <Label htmlFor="simple2">Option 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="simple3" />
                      <Label htmlFor="simple3">Option 3</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horizontal Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="small" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="size1" />
                      <Label htmlFor="size1">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="size2" />
                      <Label htmlFor="size2">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="size3" />
                      <Label htmlFor="size3">Large</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Payment Method Selection
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="card" className="space-y-3">
                  {paymentMethods.map((method) => (
                    <RadioGroupItemLabel key={method.value} selected={false}>
                      <RadioGroupItem value={method.value} />
                      <div className="flex items-center gap-3">
                        <method.icon className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-muted-foreground text-sm">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </RadioGroupItemLabel>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Shipping Options</h3>
            <Card>
              <CardHeader>
                <CardTitle>Select Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="standard" className="space-y-3">
                  {shippingOptions.map((option) => (
                    <RadioGroupItemLabel key={option.value} selected={false}>
                      <RadioGroupItem value={option.value} />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <option.icon className="text-muted-foreground h-5 w-5" />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-muted-foreground text-sm">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{option.price}</p>
                        </div>
                      </div>
                    </RadioGroupItemLabel>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Settings Form</h3>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block text-base font-semibold">
                    Email Frequency
                  </Label>
                  <RadioGroup defaultValue="weekly" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly summary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly newsletter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="never" id="never" />
                      <Label htmlFor="never">No emails</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-3 block text-base font-semibold">
                    Theme Preference
                  </Label>
                  <RadioGroup defaultValue="system" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light theme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark theme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System preference</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Radio Group Components
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Component</th>
                    <th className="p-2 text-left font-medium">Props</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">RadioGroup</td>
                    <td className="p-2 font-mono">
                      value, onValueChange, disabled, name
                    </td>
                    <td className="p-2">Root radio group container</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">RadioGroupItem</td>
                    <td className="p-2 font-mono">value, disabled, id</td>
                    <td className="p-2">Individual radio button</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">RadioGroupItemLabel</td>
                    <td className="p-2 font-mono">selected, className</td>
                    <td className="p-2">Enhanced label with styling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">RadioGroup Props</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Prop</th>
                    <th className="p-2 text-left font-medium">Type</th>
                    <th className="p-2 text-left font-medium">Default</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">value</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Currently selected value</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">onValueChange</td>
                    <td className="p-2 font-mono">
                      (value: string) ={'>'} void
                    </td>
                    <td className="p-2">-</td>
                    <td className="p-2">Callback when selection changes</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">defaultValue</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Default selected value</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">disabled</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Disable the entire group</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">name</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">
                      HTML name attribute for form submission
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">required</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Mark as required field</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">dir</td>
                    <td className="p-2 font-mono">'ltr' | 'rtl'</td>
                    <td className="p-2">'ltr'</td>
                    <td className="p-2">
                      Text direction for internationalization
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">loop</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">true</td>
                    <td className="p-2">
                      Whether keyboard navigation should loop
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">RadioGroupItem Props</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Prop</th>
                    <th className="p-2 text-left font-medium">Type</th>
                    <th className="p-2 text-left font-medium">Default</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">value</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Value when this item is selected</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">disabled</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Disable this specific item</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">id</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">HTML id for label association</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Layout Options</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Layout Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Vertical (default)</Badge>
                  <Badge variant="secondary">Horizontal</Badge>
                  <Badge variant="secondary">Grid layout</Badge>
                  <Badge variant="secondary">Enhanced labels</Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Vertical (default)
<RadioGroup className="space-y-2">

// Horizontal
<RadioGroup className="flex gap-4">

// Grid
<RadioGroup className="grid grid-cols-2 gap-4">

// Enhanced labels
<RadioGroupItemLabel selected={selected}>
  <RadioGroupItem value="option" />
  <div>Enhanced content</div>
</RadioGroupItemLabel>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      }
      usageGuidelines={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Usage</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Radio groups allow users to select a single option from a list of
              mutually exclusive choices.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { RadioGroup, RadioGroupItem } from '@portal/ui/radio-group';
import { Label } from '@portal/ui/label';

function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="card" id="card" />
        <Label htmlFor="card">Credit Card</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paypal" id="paypal" />
        <Label htmlFor="paypal">PayPal</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="bank" id="bank" />
        <Label htmlFor="bank">Bank Transfer</Label>
      </div>
    </RadioGroup>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Form Integration</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { useForm } from 'react-hook-form';

function SettingsForm() {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="theme"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Theme Preference</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="light" />
                  </FormControl>
                  <FormLabel className="font-normal">Light</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dark" />
                  </FormControl>
                  <FormLabel className="font-normal">Dark</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="system" />
                  </FormControl>
                  <FormLabel className="font-normal">System</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Enhanced Labels</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { RadioGroupItemLabel } from '@portal/ui/radio-group';

<RadioGroup value={selected} onValueChange={setSelected}>
  {options.map((option) => (
    <RadioGroupItemLabel
      key={option.value}
      selected={selected === option.value}
    >
      <RadioGroupItem value={option.value} />
      <div className="flex items-center gap-3">
        <option.icon className="h-5 w-5" />
        <div>
          <p className="font-medium">{option.label}</p>
          <p className="text-sm text-muted-foreground">
            {option.description}
          </p>
        </div>
      </div>
    </RadioGroupItemLabel>
  ))}
</RadioGroup>`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Selection Guidelines</h4>
                <p>
                  • Use radio groups for mutually exclusive choices (2-7
                  options)
                </p>
                <p>
                  • For single true/false choices, consider using a checkbox or
                  switch
                </p>
                <p>• For many options (8+), consider using a select dropdown</p>
                <p>• Always provide a default selection when appropriate</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Layout and Design</h4>
                <p>• Use vertical layout for better scannability</p>
                <p>• Group related options together</p>
                <p>• Provide clear, descriptive labels</p>
                <p>• Consider using enhanced labels for complex options</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Accessibility</h4>
                <p>
                  • Always associate labels with radio buttons using htmlFor/id
                </p>
                <p>• Use fieldset and legend for grouped options</p>
                <p>• Ensure sufficient color contrast</p>
                <p>• Test with keyboard navigation and screen readers</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { RadioGroupStory };
