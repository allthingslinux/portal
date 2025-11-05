'use client';

import { useState } from 'react';

import {
  AlertTriangle,
  Archive,
  Ban,
  Download,
  LogOut,
  RefreshCw,
  Share,
  Trash2,
  UserX,
  X,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@portal/ui/alert-dialog';
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
import { Textarea } from '@portal/ui/textarea';

import { useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface AlertDialogControls {
  title: string;
  description: string;
  triggerText: string;
  triggerVariant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  actionText: string;
  actionVariant: 'default' | 'destructive';
  cancelText: string;
  withIcon: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const triggerVariantOptions = [
  { value: 'destructive', label: 'Destructive', description: 'Danger button' },
  { value: 'outline', label: 'Outline', description: 'Outlined button' },
  { value: 'default', label: 'Default', description: 'Primary button' },
  { value: 'secondary', label: 'Secondary', description: 'Secondary style' },
  { value: 'ghost', label: 'Ghost', description: 'Minimal button' },
] as const;

const actionVariantOptions = [
  {
    value: 'destructive',
    label: 'Destructive',
    description: 'For dangerous actions',
  },
  { value: 'default', label: 'Default', description: 'For normal actions' },
] as const;

const severityOptions = [
  { value: 'info', label: 'Info', description: 'General information' },
  { value: 'warning', label: 'Warning', description: 'Caution required' },
  { value: 'error', label: 'Error', description: 'Destructive action' },
  { value: 'success', label: 'Success', description: 'Positive action' },
] as const;

const iconOptions = [
  { value: 'trash', icon: Trash2, label: 'Trash' },
  { value: 'alert', icon: AlertTriangle, label: 'Alert Triangle' },
  { value: 'logout', icon: LogOut, label: 'Log Out' },
  { value: 'userx', icon: UserX, label: 'User X' },
  { value: 'x', icon: X, label: 'X' },
  { value: 'ban', icon: Ban, label: 'Ban' },
  { value: 'archive', icon: Archive, label: 'Archive' },
  { value: 'download', icon: Download, label: 'Download' },
];

export function AlertDialogStory() {
  const { controls, updateControl } = useStoryControls<AlertDialogControls>({
    title: 'Are you absolutely sure?',
    description:
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    triggerText: 'Delete Account',
    triggerVariant: 'destructive',
    actionText: 'Yes, delete account',
    actionVariant: 'destructive',
    cancelText: 'Cancel',
    withIcon: true,
    severity: 'error',
  });

  const [selectedIcon, setSelectedIcon] = useState('trash');

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || AlertTriangle;

  const generateCode = () => {
    let code = `<AlertDialog>\n`;
    code += `  <AlertDialogTrigger asChild>\n`;
    code += `    <Button variant="${controls.triggerVariant}">${controls.triggerText}</Button>\n`;
    code += `  </AlertDialogTrigger>\n`;
    code += `  <AlertDialogContent>\n`;
    code += `    <AlertDialogHeader>\n`;

    if (controls.withIcon) {
      code += `      <div className="flex items-center gap-3">\n`;
      code += `        <div className="${getSeverityIconStyles(controls.severity)}">\n`;
      const iconName = selectedIconData?.icon.name || 'AlertTriangle';
      code += `          <${iconName} className="h-5 w-5" />\n`;
      code += `        </div>\n`;
      code += `        <AlertDialogTitle>${controls.title}</AlertDialogTitle>\n`;
      code += `      </div>\n`;
    } else {
      code += `      <AlertDialogTitle>${controls.title}</AlertDialogTitle>\n`;
    }

    if (controls.description) {
      code += `      <AlertDialogDescription>\n`;
      code += `        ${controls.description}\n`;
      code += `      </AlertDialogDescription>\n`;
    }

    code += `    </AlertDialogHeader>\n`;
    code += `    <AlertDialogFooter>\n`;
    code += `      <AlertDialogCancel>${controls.cancelText}</AlertDialogCancel>\n`;

    if (controls.actionVariant === 'destructive') {
      code += `      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">\n`;
    } else {
      code += `      <AlertDialogAction>\n`;
    }

    code += `        ${controls.actionText}\n`;
    code += `      </AlertDialogAction>\n`;
    code += `    </AlertDialogFooter>\n`;
    code += `  </AlertDialogContent>\n`;
    code += `</AlertDialog>`;

    return code;
  };

  const getSeverityIconStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive';
      case 'warning':
        return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'success':
        return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500';
      default:
        return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500';
    }
  };

  const renderPreview = () => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={controls.triggerVariant}>
            {controls.triggerText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            {controls.withIcon ? (
              <div className="flex items-center gap-3">
                <div className={getSeverityIconStyles(controls.severity)}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <AlertDialogTitle>{controls.title}</AlertDialogTitle>
              </div>
            ) : (
              <AlertDialogTitle>{controls.title}</AlertDialogTitle>
            )}
            {controls.description && (
              <AlertDialogDescription>
                {controls.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{controls.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              className={
                controls.actionVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
            >
              {controls.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="severity">Severity Level</Label>
        <SimpleStorySelect
          value={controls.severity}
          onValueChange={(value) => updateControl('severity', value)}
          options={severityOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggerVariant">Trigger Button Style</Label>
        <SimpleStorySelect
          value={controls.triggerVariant}
          onValueChange={(value) => updateControl('triggerVariant', value)}
          options={triggerVariantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actionVariant">Action Button Style</Label>
        <SimpleStorySelect
          value={controls.actionVariant}
          onValueChange={(value) => updateControl('actionVariant', value)}
          options={actionVariantOptions}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="triggerText">Trigger Text</Label>
        <Input
          id="triggerText"
          value={controls.triggerText}
          onChange={(e) => updateControl('triggerText', e.target.value)}
          placeholder="Button text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Alert Title</Label>
        <Input
          id="title"
          value={controls.title}
          onChange={(e) => updateControl('title', e.target.value)}
          placeholder="Alert dialog title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={controls.description}
          onChange={(e) => updateControl('description', e.target.value)}
          placeholder="Alert description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actionText">Action Button Text</Label>
        <Input
          id="actionText"
          value={controls.actionText}
          onChange={(e) => updateControl('actionText', e.target.value)}
          placeholder="Confirm action text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cancelText">Cancel Button Text</Label>
        <Input
          id="cancelText"
          value={controls.cancelText}
          onChange={(e) => updateControl('cancelText', e.target.value)}
          placeholder="Cancel action text"
        />
      </div>

      <Separator />

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
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Destructive Actions</CardTitle>
          <CardDescription>
            Critical confirmations for dangerous operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/15 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    Are you sure you want to delete this item? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You'll need to sign in
                    again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay Signed In</AlertDialogCancel>
                  <AlertDialogAction>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <UserX className="mr-2 h-4 w-4" />
                  Remove User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/15 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <UserX className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Remove User Access</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    This will remove the user's access to this workspace. They
                    will no longer be able to view or edit content.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remove Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation Actions</CardTitle>
          <CardDescription>
            Standard confirmations for important actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">
                      <Archive className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Archive Project</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    This will archive the project and make it read-only. You can
                    restore it later from the archived projects section.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Archive Project</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500">
                      <Download className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Export Your Data</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    This will generate a complete export of your data. The
                    export may take a few minutes to complete and will be sent
                    to your email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Start Export</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Settings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    This will reset all your preferences to their default
                    values. Your data will not be affected, but you'll need to
                    reconfigure your settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Reset Settings</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Different Severity Levels</CardTitle>
          <CardDescription>
            Visual indicators for different types of actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Error/Destructive</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Forever
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-destructive/15 text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                      This action cannot be undone. The item will be permanently
                      deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Warning</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Unsaved Changes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                      You have unsaved changes. Are you sure you want to leave
                      without saving?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Stay Here</AlertDialogCancel>
                    <AlertDialogAction>Leave Without Saving</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Info</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share className="mr-2 h-4 w-4" />
                    Share Publicly
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">
                        <Share className="h-5 w-5" />
                      </div>
                      <AlertDialogTitle>Share Publicly</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                      This will make your project visible to everyone with the
                      link. Anyone can view and comment on it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Private</AlertDialogCancel>
                    <AlertDialogAction>Make Public</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Success</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Complete Setup
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500">
                        <Download className="h-5 w-5" />
                      </div>
                      <AlertDialogTitle>Complete Setup</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                      You're about to complete the initial setup. This will
                      activate all features and send you a welcome email.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Not Yet</AlertDialogCancel>
                    <AlertDialogAction>Complete Setup</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>AlertDialog Components</CardTitle>
        <CardDescription>
          Complete API reference for AlertDialog components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">AlertDialog</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Root container for alert dialogs. Always modal and requires
              explicit user action.
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
                    <td className="p-3 font-mono text-sm">open</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Controlled open state</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">onOpenChange</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Callback when open state changes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">AlertDialogAction</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The button that performs the primary action. Closes the dialog
              when clicked.
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
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">
                      Additional CSS classes (includes button styles by default)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">AlertDialogCancel</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The button that cancels the action. Always closes the dialog
              without performing the action.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">Other Components</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>AlertDialogTrigger:</strong> Element that opens the
                alert dialog
              </li>
              <li>
                <strong>AlertDialogContent:</strong> Main dialog content
                container
              </li>
              <li>
                <strong>AlertDialogHeader:</strong> Container for title and
                description
              </li>
              <li>
                <strong>AlertDialogTitle:</strong> Required accessible title
              </li>
              <li>
                <strong>AlertDialogDescription:</strong> Detailed explanation of
                the action
              </li>
              <li>
                <strong>AlertDialogFooter:</strong> Container for action buttons
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
          <CardTitle>When to Use AlertDialog</CardTitle>
          <CardDescription>
            Best practices for alert dialog usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use AlertDialog For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Destructive actions (delete, remove, cancel)</li>
              <li>• Critical confirmations before irreversible actions</li>
              <li>• Warning users about consequences</li>
              <li>• Confirming navigation away from unsaved work</li>
              <li>• System-critical decisions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid AlertDialog For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Complex forms or data entry</li>
              <li>• Informational content (use Dialog instead)</li>
              <li>• Non-critical confirmations</li>
              <li>• Multi-step processes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AlertDialog vs Dialog</CardTitle>
          <CardDescription>Understanding the differences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold">AlertDialog</h4>
              <ul className="space-y-1 text-sm">
                <li>• Always modal and blocking</li>
                <li>• Requires explicit action</li>
                <li>• Cannot be dismissed by clicking outside</li>
                <li>• Purpose-built for confirmations</li>
                <li>• Has dedicated Action/Cancel buttons</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Dialog</h4>
              <ul className="space-y-1 text-sm">
                <li>• Can be modal or non-modal</li>
                <li>• Can be dismissed by clicking outside</li>
                <li>• Flexible content and actions</li>
                <li>• Better for forms and complex content</li>
                <li>• Has close button in header</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>Making alert dialogs accessible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Focus Management</h4>
            <p className="text-muted-foreground text-sm">
              • Focus moves to Cancel button by default
              <br />
              • Tab navigation between Cancel and Action
              <br />
              • Escape key activates Cancel action
              <br />• Enter key activates Action button when focused
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Content Guidelines</h4>
            <p className="text-muted-foreground text-sm">
              • Use clear, specific titles and descriptions
              <br />
              • Explain consequences of the action
              <br />
              • Use action-specific button labels
              <br />• Always provide a way to cancel
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Visual Design</h4>
            <p className="text-muted-foreground text-sm">
              • Use appropriate icons and colors for severity
              <br />
              • Make destructive actions visually distinct
              <br />• Ensure sufficient contrast for all text
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Writing Effective Alerts</CardTitle>
          <CardDescription>
            Content guidelines for alert dialogs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Title Guidelines</h4>
            <p className="text-muted-foreground text-sm">
              • Be specific about the action (not just "Are you sure?")
              <br />
              • Use active voice ("Delete account" not "Account deletion")
              <br />• Keep it concise but descriptive
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Description Guidelines</h4>
            <p className="text-muted-foreground text-sm">
              • Explain what will happen
              <br />
              • Mention if the action is irreversible
              <br />
              • Provide context about consequences
              <br />• Use plain, non-technical language
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Button Labels</h4>
            <p className="text-muted-foreground text-sm">
              • Use specific verbs ("Delete", "Save", "Continue")
              <br />
              • Match the action being performed
              <br />
              • Avoid generic labels when possible
              <br />• Make the primary action clear
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
