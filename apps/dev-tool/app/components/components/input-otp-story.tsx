'use client';

import { useState } from 'react';

import { LockIcon, ShieldIcon, SmartphoneIcon } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@portal/ui/input-otp';
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
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface InputOTPStoryControls {
  maxLength: number;
  pattern: 'digits' | 'alphanumeric' | 'letters';
  disabled: boolean;
  showSeparator: boolean;
  groupSize: number;
  autoSubmit: boolean;
  showValue: boolean;
}

const PATTERN_REGEX = {
  digits: /^[0-9]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  letters: /^[a-zA-Z]+$/,
};

export default function InputOTPStory() {
  const [controls, setControls] = useState<InputOTPStoryControls>({
    maxLength: 6,
    pattern: 'digits',
    disabled: false,
    showSeparator: true,
    groupSize: 3,
    autoSubmit: false,
    showValue: true,
  });

  const [otpValue, setOtpValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);

  const generateCode = () => {
    const components = ['InputOTP', 'InputOTPGroup', 'InputOTPSlot'];
    if (controls.showSeparator) {
      components.push('InputOTPSeparator');
    }

    const importStatement = generateImportStatement(
      components,
      '@portal/ui/input-otp',
    );
    const stateImport = "const [value, setValue] = useState('');";

    const patternProp =
      controls.pattern !== 'digits'
        ? `REGEXP_ONLY_${controls.pattern.toUpperCase()}`
        : undefined;

    const otpProps = generatePropsString(
      {
        maxLength: controls.maxLength,
        value: 'value',
        onChange: 'setValue',
        disabled: controls.disabled ? true : undefined,
        pattern: patternProp,
      },
      {
        maxLength: 6,
        disabled: false,
      },
    );

    // Generate slots with groups and separators
    const totalSlots = controls.maxLength;
    const groupSize = controls.groupSize;
    const slots = [];

    let currentGroupSlots = [];

    for (let i = 0; i < totalSlots; i++) {
      currentGroupSlots.push(`        <InputOTPSlot index={${i}} />`);

      // If we've reached group size or it's the last slot
      if (currentGroupSlots.length === groupSize || i === totalSlots - 1) {
        slots.push(
          `      <InputOTPGroup>\n${currentGroupSlots.join('\n')}\n      </InputOTPGroup>`,
        );

        // Add separator if not the last group and separators are enabled
        if (i < totalSlots - 1 && controls.showSeparator) {
          slots.push('      <InputOTPSeparator />');
        }

        currentGroupSlots = [];
      }
    }

    const otpStructure = `<InputOTP${otpProps}>\n${slots.join('\n')}\n    </InputOTP>`;

    let patternConstants = '';
    if (controls.pattern !== 'digits') {
      patternConstants = `\n// Pattern for ${controls.pattern} input\nconst REGEXP_ONLY_${controls.pattern.toUpperCase()} = /${controls.pattern === 'alphanumeric' ? '^[a-zA-Z0-9]+$' : '^[a-zA-Z]+$'}/;\n`;
    }

    const fullComponent = `${importStatement}\n\n${stateImport}${patternConstants}\n\nfunction OTPInput() {\n  return (\n    ${otpStructure}\n  );\n}`;

    return fullComponent;
  };

  const handleOTPChange = (value: string) => {
    setOtpValue(value);

    if (controls.autoSubmit && value.length === controls.maxLength) {
      setSubmittedValue(value);
      setTimeout(() => setSubmittedValue(null), 3000);
    }
  };

  const handleSubmit = () => {
    setSubmittedValue(otpValue);
    setTimeout(() => setSubmittedValue(null), 3000);
  };

  const renderOTPSlots = () => {
    const slots = [];
    const groupSize = controls.groupSize;
    const totalSlots = controls.maxLength;

    for (let i = 0; i < totalSlots; i++) {
      if (i > 0 && i % groupSize === 0 && controls.showSeparator) {
        slots.push(<InputOTPSeparator key={`separator-${i}`} />);
      }

      slots.push(<InputOTPSlot key={i} index={i} />);
    }

    return slots;
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>OTP Input Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Max Length</label>
            <Select
              value={controls.maxLength.toString()}
              onValueChange={(value) =>
                setControls((prev) => ({ ...prev, maxLength: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 digits</SelectItem>
                <SelectItem value="5">5 digits</SelectItem>
                <SelectItem value="6">6 digits</SelectItem>
                <SelectItem value="8">8 digits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Pattern</label>
            <Select
              value={controls.pattern}
              onValueChange={(value: InputOTPStoryControls['pattern']) =>
                setControls((prev) => ({ ...prev, pattern: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digits">Numbers only</SelectItem>
                <SelectItem value="alphanumeric">Alphanumeric</SelectItem>
                <SelectItem value="letters">Letters only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Group Size</label>
            <Select
              value={controls.groupSize.toString()}
              onValueChange={(value) =>
                setControls((prev) => ({ ...prev, groupSize: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 digits</SelectItem>
                <SelectItem value="3">3 digits</SelectItem>
                <SelectItem value="4">4 digits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="disabled"
              checked={controls.disabled}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, disabled: checked }))
              }
            />
            <label htmlFor="disabled" className="text-sm">
              Disabled
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showSeparator"
              checked={controls.showSeparator}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, showSeparator: checked }))
              }
            />
            <label htmlFor="showSeparator" className="text-sm">
              Show Separator
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoSubmit"
              checked={controls.autoSubmit}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, autoSubmit: checked }))
              }
            />
            <label htmlFor="autoSubmit" className="text-sm">
              Auto Submit
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showValue"
              checked={controls.showValue}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, showValue: checked }))
              }
            />
            <label htmlFor="showValue" className="text-sm">
              Show Value
            </label>
          </div>
        </div>

        {controls.showValue && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="mb-1 text-sm font-medium">Current Value:</p>
            <p className="font-mono text-sm">
              {otpValue || 'Empty'} ({otpValue.length}/{controls.maxLength})
            </p>
          </div>
        )}

        {submittedValue && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-3">
              <p className="text-sm font-medium text-green-800">
                OTP Submitted!
              </p>
              <p className="font-mono text-sm text-green-700">
                {submittedValue}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>OTP Input Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={controls.maxLength}
              value={otpValue}
              onChange={handleOTPChange}
              disabled={controls.disabled}
              pattern={PATTERN_REGEX[controls.pattern]}
            >
              <InputOTPGroup>{renderOTPSlots()}</InputOTPGroup>
            </InputOTP>

            <div className="flex gap-2">
              <Button
                onClick={() => setOtpValue('')}
                variant="outline"
                size="sm"
                disabled={controls.disabled || !otpValue}
              >
                Clear
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={
                  controls.disabled || otpValue.length !== controls.maxLength
                }
                size="sm"
              >
                Verify OTP
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-2 font-semibold">Configuration:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Length: {controls.maxLength}</div>
              <div>Pattern: {controls.pattern}</div>
              <div>Group Size: {controls.groupSize}</div>
              <div>Separator: {controls.showSeparator ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive OTP Input"
      previewDescription="One-time password input with customizable length, patterns, and grouping"
      controlsTitle="Configuration"
      controlsDescription="Adjust OTP input length, pattern validation, and behavior"
      generatedCode={generateCode()}
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Authentication Forms</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="text-center">
                  <LockIcon className="text-primary mx-auto mb-2 h-8 w-8" />
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <p className="text-muted-foreground text-center text-sm">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <InputOTP maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button className="w-full">Verify Code</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <SmartphoneIcon className="text-primary mx-auto mb-2 h-8 w-8" />
                  <CardTitle>SMS Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <p className="text-muted-foreground text-center text-sm">
                    We sent a code to +1 (555) 123-****
                  </p>
                  <InputOTP maxLength={4}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                  <div className="flex w-full gap-2">
                    <Button variant="outline" className="flex-1">
                      Resend Code
                    </Button>
                    <Button className="flex-1">Verify</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Different Patterns</h3>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Numeric Only (Default)</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <InputOTP maxLength={6} pattern={PATTERN_REGEX.digits}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alphanumeric Code</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <InputOTP maxLength={8} pattern={PATTERN_REGEX.alphanumeric}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Letters Only</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <InputOTP maxLength={5} pattern={PATTERN_REGEX.letters}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                    </InputOTPGroup>
                  </InputOTP>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Security Context</h3>
            <Card>
              <CardHeader className="text-center">
                <ShieldIcon className="text-primary mx-auto mb-2 h-12 w-12" />
                <CardTitle>Secure Payment Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Security Alert:</strong> Please confirm this payment
                    by entering your 6-digit security code.
                  </p>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground text-sm">
                    Payment Amount: <strong>$249.99</strong>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Merchant: TechStore Inc.
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Cancel Payment
                  </Button>
                  <Button className="flex-1">Confirm Payment</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">InputOTP Components</h3>
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
                    <td className="p-2 font-mono">InputOTP</td>
                    <td className="p-2 font-mono">
                      maxLength, value, onChange, pattern, disabled
                    </td>
                    <td className="p-2">Root OTP input container</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">InputOTPGroup</td>
                    <td className="p-2 font-mono">className</td>
                    <td className="p-2">Groups OTP slots together</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">InputOTPSlot</td>
                    <td className="p-2 font-mono">index, className</td>
                    <td className="p-2">Individual character input slot</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">InputOTPSeparator</td>
                    <td className="p-2 font-mono">className</td>
                    <td className="p-2">Visual separator between groups</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">InputOTP Props</h3>
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
                    <td className="p-2 font-mono">maxLength</td>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">6</td>
                    <td className="p-2">Maximum number of characters</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">value</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">''</td>
                    <td className="p-2">Current OTP value</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">onChange</td>
                    <td className="p-2 font-mono">
                      (value: string) ={'>'} void
                    </td>
                    <td className="p-2">-</td>
                    <td className="p-2">Callback when value changes</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">pattern</td>
                    <td className="p-2 font-mono">RegExp</td>
                    <td className="p-2">/^[0-9]+$/</td>
                    <td className="p-2">Pattern for input validation</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">disabled</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Disable the input</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">autoFocus</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Auto focus first slot</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Pattern Examples</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Common Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Numbers only</Badge>
                  <Badge variant="secondary">Alphanumeric</Badge>
                  <Badge variant="secondary">Letters only</Badge>
                  <Badge variant="secondary">Custom pattern</Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Numbers only (default)
pattern={/^[0-9]+$/}

// Alphanumeric
pattern={/^[a-zA-Z0-9]+$/}

// Letters only
pattern={/^[a-zA-Z]+$/}

// Custom: Numbers and dashes
pattern={/^[0-9-]+$/}`}
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
              OTP inputs are commonly used for two-factor authentication, SMS
              verification, and secure confirmations.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@portal/ui/input-otp';

function OTPForm() {
  const [value, setValue] = useState('');

  return (
    <InputOTP 
      maxLength={6} 
      value={value} 
      onChange={setValue}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
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

function TwoFactorForm() {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="otp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Verification Code</FormLabel>
            <FormControl>
              <InputOTP maxLength={6} {...field}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormDescription>
              Enter the 6-digit code from your authenticator app.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Verify</Button>
    </form>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Security Best Practices
            </h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Implementation</h4>
                <p>• Set appropriate maxLength for your use case</p>
                <p>• Use pattern validation to restrict input types</p>
                <p>• Implement auto-submit when complete</p>
                <p>• Provide clear feedback for invalid codes</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">User Experience</h4>
                <p>• Auto-focus the first input slot</p>
                <p>• Allow paste operations for convenience</p>
                <p>• Provide resend functionality with rate limiting</p>
                <p>• Clear visual feedback for active slots</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Accessibility</h4>
                <p>• Ensure proper keyboard navigation</p>
                <p>• Announce state changes to screen readers</p>
                <p>• Provide clear instructions and labels</p>
                <p>• Support standard form validation patterns</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Common Use Cases</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Authentication</h4>
                <p>• Two-factor authentication (6 digits)</p>
                <p>• SMS verification codes (4-6 digits)</p>
                <p>• Email verification (6-8 characters)</p>
                <p>• Backup codes (8-12 characters)</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Transactions</h4>
                <p>• Payment confirmations (6 digits)</p>
                <p>• Transfer authorizations (4-8 digits)</p>
                <p>• Account access PINs (4-6 digits)</p>
                <p>• Secure operations (variable length)</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { InputOTPStory };
