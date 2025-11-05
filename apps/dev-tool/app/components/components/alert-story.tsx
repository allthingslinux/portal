'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Terminal,
  XCircle,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
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
import { Textarea } from '@portal/ui/textarea';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { StorySelect } from './story-select';

interface AlertControls {
  variant: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  showIcon: boolean;
  showTitle: boolean;
  iconType:
    | 'alert'
    | 'warning'
    | 'success'
    | 'info'
    | 'error'
    | 'terminal'
    | 'lightbulb';
  className: string;
}

const iconOptions = [
  {
    value: 'alert',
    icon: AlertCircle,
    iconName: 'AlertCircle',
    label: 'Alert Circle',
    description: 'General alerts',
  },
  {
    value: 'warning',
    icon: AlertTriangle,
    iconName: 'AlertTriangle',
    label: 'Warning',
    description: 'Warning messages',
  },
  {
    value: 'success',
    icon: CheckCircle,
    iconName: 'CheckCircle',
    label: 'Success',
    description: 'Success messages',
  },
  {
    value: 'info',
    icon: Info,
    iconName: 'Info',
    label: 'Info',
    description: 'Informational messages',
  },
  {
    value: 'error',
    icon: XCircle,
    iconName: 'XCircle',
    label: 'Error',
    description: 'Error messages',
  },
  {
    value: 'terminal',
    icon: Terminal,
    iconName: 'Terminal',
    label: 'Terminal',
    description: 'Code/technical messages',
  },
  {
    value: 'lightbulb',
    icon: Lightbulb,
    iconName: 'Lightbulb',
    label: 'Lightbulb',
    description: 'Tips and suggestions',
  },
] as const;

export function AlertStory() {
  const { controls, updateControl } = useStoryControls<AlertControls>({
    variant: 'default',
    title: 'Alert Title',
    description:
      'This is an alert description that provides additional context and information.',
    showIcon: true,
    showTitle: true,
    iconType: 'alert',
    className: '',
  });

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === controls.iconType,
  );
  const SelectedIcon = selectedIconData?.icon || AlertCircle;

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        variant: controls.variant,
        className: controls.className,
      },
      {
        variant: 'default',
        className: '',
      },
    );

    let code = `<Alert${propsString}>\n`;

    if (controls.showIcon) {
      const iconName = selectedIconData?.iconName || 'AlertCircle';
      code += `  <${iconName} className="h-4 w-4" />\n`;
    }

    if (controls.showTitle) {
      code += `  <AlertTitle>${controls.title}</AlertTitle>\n`;
    }

    code += `  <AlertDescription>\n    ${controls.description}\n  </AlertDescription>\n`;
    code += `</Alert>`;

    return code;
  };

  const variantOptions = [
    {
      value: 'default' as const,
      label: 'Default',
      description: 'Standard alert style',
    },
    {
      value: 'destructive' as const,
      label: 'Destructive',
      description: 'Error/danger style',
    },
    {
      value: 'success' as const,
      label: 'Success',
      description: 'Success/positive style',
    },
    {
      value: 'warning' as const,
      label: 'Warning',
      description: 'Warning/caution style',
    },
    {
      value: 'info' as const,
      label: 'Info',
      description: 'Information style',
    },
  ];

  const renderPreview = () => (
    <Alert variant={controls.variant} className={controls.className}>
      {controls.showIcon && <SelectedIcon className="h-4 w-4" />}
      {controls.showTitle && <AlertTitle>{controls.title}</AlertTitle>}
      <AlertDescription>{controls.description}</AlertDescription>
    </Alert>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="variant">Variant</Label>
        <StorySelect
          value={controls.variant}
          onValueChange={(value) => updateControl('variant', value)}
          options={variantOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="showIcon">Show Icon</Label>
        <Switch
          id="showIcon"
          checked={controls.showIcon}
          onCheckedChange={(checked) => updateControl('showIcon', checked)}
        />
      </div>

      {controls.showIcon && (
        <div className="space-y-2">
          <Label htmlFor="iconType">Icon Type</Label>
          <StorySelect
            value={controls.iconType}
            onValueChange={(value) => updateControl('iconType', value)}
            options={iconOptions}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="showTitle">Show Title</Label>
        <Switch
          id="showTitle"
          checked={controls.showTitle}
          onCheckedChange={(checked) => updateControl('showTitle', checked)}
        />
      </div>

      {controls.showTitle && (
        <div className="space-y-2">
          <Label htmlFor="title">Alert Title</Label>
          <Input
            id="title"
            value={controls.title}
            onChange={(e) => updateControl('title', e.target.value)}
            placeholder="Enter alert title"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={controls.description}
          onChange={(e) => updateControl('description', e.target.value)}
          placeholder="Enter alert description"
          rows={3}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="className">Custom Classes</Label>
        <Input
          id="className"
          value={controls.className}
          onChange={(e) => updateControl('className', e.target.value)}
          placeholder="e.g. border-l-4 border-blue-500"
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Information Alerts</CardTitle>
          <CardDescription>
            General information and status updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a general information alert that provides useful context
              to the user.
            </AlertDescription>
          </Alert>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Pro Tip</AlertTitle>
            <AlertDescription>
              You can use keyboard shortcuts to navigate faster. Press Ctrl+K to
              open the command palette.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Alerts</CardTitle>
          <CardDescription>Positive feedback and confirmations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully. All data is now up to
              date.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Account created successfully. Welcome to our platform!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Warning Alerts</CardTitle>
          <CardDescription>
            Caution and attention-needed messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your free trial expires in 3 days. Upgrade your account to
              continue using all features.
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Please verify your email address to complete your account setup.
              Check your inbox for the verification link.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Alerts</CardTitle>
          <CardDescription>
            Error messages and destructive alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to save changes. Please check your internet connection and
              try again.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>
              Invalid credentials. Please check your username and password and
              try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Alerts</CardTitle>
          <CardDescription>Code and system-related messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>System Status</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <code className="bg-muted rounded px-2 py-1 text-sm">
                  npm install @portal/ui
                </code>
              </div>
              <p className="mt-2">
                Run this command to install the UI components package.
              </p>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertTitle>API Update</AlertTitle>
            <AlertDescription>
              A new API version is available. Please update your integration to
              use v2.0 for improved performance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Alert Components</CardTitle>
        <CardDescription>
          Complete API reference for Alert components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Alert */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">Alert</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The root container component for alert messages.
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
                      'default' | 'destructive' | 'success' | 'warning' | 'info'
                    </td>
                    <td className="p-3 font-mono text-sm">'default'</td>
                    <td className="p-3">Visual style variant of the alert</td>
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
                    <td className="p-3">
                      Alert content (icon, title, description)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AlertTitle & AlertDescription */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">
              AlertTitle & AlertDescription
            </h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Semantic components for alert titles and descriptions.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Component</th>
                    <th className="p-3 text-left font-medium">Element</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">AlertTitle</td>
                    <td className="p-3 font-mono text-sm">h5</td>
                    <td className="p-3">Main heading for the alert</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">AlertDescription</td>
                    <td className="p-3 font-mono text-sm">div</td>
                    <td className="p-3">Detailed description of the alert</td>
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
          <CardTitle>When to Use Alerts</CardTitle>
          <CardDescription>Best practices for alert usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Alerts For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• System status updates and notifications</li>
              <li>• Form validation messages</li>
              <li>• Important announcements</li>
              <li>• Error messages and troubleshooting info</li>
              <li>• Success confirmations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Alerts For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Regular content or body text</li>
              <li>• Marketing messages (use cards instead)</li>
              <li>• Navigation elements</li>
              <li>• Content that doesn't require immediate attention</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Hierarchy</CardTitle>
          <CardDescription>
            Using alerts effectively by priority
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-semibold">
                  Critical (Destructive)
                </h4>
              </div>
              <p className="text-muted-foreground ml-6 text-sm">
                System errors, failed operations, security issues
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-semibold">Warning</h4>
              </div>
              <p className="text-muted-foreground ml-6 text-sm">
                Actions needed, potential issues, expiring items
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-semibold">Success</h4>
              </div>
              <p className="text-muted-foreground ml-6 text-sm">
                Successful operations, confirmations
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold">Information</h4>
              </div>
              <p className="text-muted-foreground ml-6 text-sm">
                General information, tips, status updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
          <CardDescription>Writing effective alert content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Be Clear and Specific</h4>
            <div className="space-y-2">
              <div className="rounded border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  ❌ "Something went wrong"
                </p>
              </div>
              <div className="rounded border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">
                  ✅ "Failed to save changes. Please check your internet
                  connection and try again."
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Provide Next Steps</h4>
            <p className="text-muted-foreground text-sm">
              When possible, include actionable steps the user can take to
              resolve the issue or continue their workflow.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Making alerts accessible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">ARIA Attributes</h4>
            <p className="text-muted-foreground text-sm">
              The Alert component automatically includes appropriate ARIA
              attributes for screen readers.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Color and Icons</h4>
            <p className="text-muted-foreground text-sm">
              Always pair colors with icons and descriptive text. Don't rely
              solely on color to convey meaning.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Focus Management</h4>
            <p className="text-muted-foreground text-sm">
              For dynamic alerts (appearing after user actions), consider
              managing focus appropriately to announce changes to screen
              readers.
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
