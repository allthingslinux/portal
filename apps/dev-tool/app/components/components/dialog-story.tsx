'use client';

import { useState } from 'react';

import {
  Download,
  Edit,
  FileText,
  Heart,
  Image,
  Info,
  MessageSquare,
  Plus,
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@portal/ui/dialog';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface DialogControls {
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
  size: 'default' | 'sm' | 'lg' | 'xl' | 'full';
  withIcon: boolean;
  withFooter: boolean;
  withForm: boolean;
  closable: boolean;
  modal: boolean;
}

const triggerVariantOptions = [
  { value: 'default', label: 'Default', description: 'Primary button style' },
  { value: 'outline', label: 'Outline', description: 'Outlined button' },
  { value: 'secondary', label: 'Secondary', description: 'Secondary style' },
  { value: 'ghost', label: 'Ghost', description: 'Minimal button' },
  { value: 'destructive', label: 'Destructive', description: 'Danger button' },
  { value: 'link', label: 'Link', description: 'Link style' },
] as const;

const sizeOptions = [
  { value: 'sm', label: 'Small', description: 'max-w-md' },
  { value: 'default', label: 'Default', description: 'max-w-lg' },
  { value: 'lg', label: 'Large', description: 'max-w-xl' },
  { value: 'xl', label: 'Extra Large', description: 'max-w-2xl' },
  { value: 'full', label: 'Full Screen', description: 'max-w-screen' },
] as const;

const iconOptions = [
  { value: 'settings', icon: Settings, label: 'Settings' },
  { value: 'user', icon: User, label: 'User' },
  { value: 'edit', icon: Edit, label: 'Edit' },
  { value: 'plus', icon: Plus, label: 'Plus' },
  { value: 'info', icon: Info, label: 'Info' },
  { value: 'file', icon: FileText, label: 'File' },
  { value: 'image', icon: Image, label: 'Image' },
  { value: 'share', icon: Share, label: 'Share' },
];

export function DialogStory() {
  const { controls, updateControl } = useStoryControls<DialogControls>({
    title: 'Edit Profile',
    description:
      "Make changes to your profile here. Click save when you're done.",
    triggerText: 'Open Dialog',
    triggerVariant: 'default',
    size: 'default',
    withIcon: false,
    withFooter: true,
    withForm: false,
    closable: true,
    modal: true,
  });

  const [selectedIcon, setSelectedIcon] = useState('settings');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer passionate about user experience.',
  });

  const selectedIconData = iconOptions.find(
    (opt) => opt.value === selectedIcon,
  );
  const IconComponent = selectedIconData?.icon || Settings;

  const generateCode = () => {
    const contentClass = cn(
      controls.size === 'sm' && 'max-w-md',
      controls.size === 'default' && 'max-w-lg',
      controls.size === 'lg' && 'max-w-xl',
      controls.size === 'xl' && 'max-w-2xl',
      controls.size === 'full' && 'h-screen max-w-screen',
    );

    const contentProps = {
      className: contentClass || undefined,
    };

    const contentPropsString = generatePropsString(contentProps, {
      className: undefined,
    });

    let code = `<Dialog>\n`;
    code += `  <DialogTrigger asChild>\n`;
    code += `    <Button variant="${controls.triggerVariant}">${controls.triggerText}</Button>\n`;
    code += `  </DialogTrigger>\n`;
    code += `  <DialogContent${contentPropsString}>\n`;
    code += `    <DialogHeader>\n`;

    if (controls.withIcon) {
      code += `      <div className="flex items-center gap-3">\n`;
      const iconName = selectedIconData?.icon.name || 'Settings';
      code += `        <${iconName} className="h-5 w-5" />\n`;
      code += `        <DialogTitle>${controls.title}</DialogTitle>\n`;
      code += `      </div>\n`;
    } else {
      code += `      <DialogTitle>${controls.title}</DialogTitle>\n`;
    }

    if (controls.description) {
      code += `      <DialogDescription>\n`;
      code += `        ${controls.description}\n`;
      code += `      </DialogDescription>\n`;
    }

    code += `    </DialogHeader>\n`;

    if (controls.withForm) {
      code += `    <div className="grid gap-4 py-4">\n`;
      code += `      <div className="grid gap-2">\n`;
      code += `        <Label htmlFor="name">Name</Label>\n`;
      code += `        <Input id="name" value="John Doe" />\n`;
      code += `      </div>\n`;
      code += `      <div className="grid gap-2">\n`;
      code += `        <Label htmlFor="email">Email</Label>\n`;
      code += `        <Input id="email" type="email" value="john@example.com" />\n`;
      code += `      </div>\n`;
      code += `    </div>\n`;
    } else {
      code += `    <div className="py-4">\n`;
      code += `      <p>Dialog content goes here.</p>\n`;
      code += `    </div>\n`;
    }

    if (controls.withFooter) {
      code += `    <DialogFooter>\n`;
      code += `      <DialogClose asChild>\n`;
      code += `        <Button variant="outline">Cancel</Button>\n`;
      code += `      </DialogClose>\n`;
      code += `      <Button>Save Changes</Button>\n`;
      code += `    </DialogFooter>\n`;
    }

    code += `  </DialogContent>\n`;
    code += `</Dialog>`;

    return code;
  };

  const renderPreview = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={controls.triggerVariant}>
            {controls.triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            controls.size === 'sm' && 'max-w-md',
            controls.size === 'lg' && 'max-w-xl',
            controls.size === 'xl' && 'max-w-2xl',
            controls.size === 'full' && 'h-screen max-w-screen',
          )}
        >
          <DialogHeader>
            {controls.withIcon ? (
              <div className="flex items-center gap-3">
                <IconComponent className="h-5 w-5" />
                <DialogTitle>{controls.title}</DialogTitle>
              </div>
            ) : (
              <DialogTitle>{controls.title}</DialogTitle>
            )}
            {controls.description && (
              <DialogDescription>{controls.description}</DialogDescription>
            )}
          </DialogHeader>

          {controls.withForm ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p>
                This is the dialog content area. You can put any content here
                including forms, images, or other interactive elements.
              </p>
            </div>
          )}

          {controls.withFooter && (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save Changes</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="triggerVariant">Trigger Button Style</Label>
        <SimpleStorySelect
          value={controls.triggerVariant}
          onValueChange={(value) => updateControl('triggerVariant', value)}
          options={triggerVariantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Dialog Size</Label>
        <SimpleStorySelect
          value={controls.size}
          onValueChange={(value) => updateControl('size', value)}
          options={sizeOptions}
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
        <Label htmlFor="title">Dialog Title</Label>
        <Input
          id="title"
          value={controls.title}
          onChange={(e) => updateControl('title', e.target.value)}
          placeholder="Dialog title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={controls.description}
          onChange={(e) => updateControl('description', e.target.value)}
          placeholder="Optional description"
          rows={2}
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

      <div className="flex items-center justify-between">
        <Label htmlFor="withFooter">With Footer</Label>
        <Switch
          id="withFooter"
          checked={controls.withFooter}
          onCheckedChange={(checked) => updateControl('withFooter', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="withForm">With Form Example</Label>
        <Switch
          id="withForm"
          checked={controls.withForm}
          onCheckedChange={(checked) => updateControl('withForm', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Dialogs</CardTitle>
          <CardDescription>Simple dialog variations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Info className="mr-2 h-4 w-4" />
                  Info Dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Information</DialogTitle>
                  <DialogDescription>
                    This is an informational dialog with some important details.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm">
                    Here you can provide additional context, instructions, or
                    any other information that helps the user understand what
                    they need to know.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Got it</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input id="edit-name" defaultValue="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      defaultValue="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      rows={3}
                      defaultValue="Software developer"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Preferences</DialogTitle>
                  <DialogDescription>
                    Customize your application settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Dark Mode</Label>
                      <p className="text-muted-foreground text-sm">
                        Switch to dark theme
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notifications</Label>
                      <p className="text-muted-foreground text-sm">
                        Receive push notifications
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog Sizes</CardTitle>
          <CardDescription>Different dialog dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Small Dialog
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Small Dialog</DialogTitle>
                  <DialogDescription>
                    This is a compact dialog.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm">
                    Perfect for simple confirmations or brief forms.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Large Dialog</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Large Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog has more space for content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p>
                    This larger dialog can accommodate more complex forms,
                    detailed information, or multiple sections of content.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="large-name">Name</Label>
                      <Input id="large-name" />
                    </div>
                    <div>
                      <Label htmlFor="large-email">Email</Label>
                      <Input id="large-email" type="email" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Variations</CardTitle>
          <CardDescription>Different types of dialog content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Image className="mr-2 h-4 w-4" />
                  Image Gallery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Image Preview</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                    <Image className="text-muted-foreground h-12 w-12" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">landscape.jpg</p>
                      <p className="text-muted-foreground text-sm">
                        2.4 MB • 1920x1080
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Feedback</DialogTitle>
                  <DialogDescription>
                    Help us improve by sharing your thoughts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="feedback-type">Type of Feedback</Label>
                    <select
                      id="feedback-type"
                      className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-2xs transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feedback-message">Message</Label>
                    <Textarea
                      id="feedback-message"
                      rows={4}
                      placeholder="Describe your feedback..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="feedback-contact" />
                    <Label htmlFor="feedback-contact" className="text-sm">
                      You can contact me about this feedback
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Dialog Components</CardTitle>
        <CardDescription>
          Complete API reference for Dialog components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Dialog</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Root container for the dialog. Contains all dialog parts.
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
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">onOpenChange</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Callback when open state changes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">modal</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">true</td>
                    <td className="p-3">Whether the dialog is modal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">DialogTrigger</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The element that opens the dialog. Use asChild prop to render as
              child element.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">DialogContent</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The main dialog content container with overlay and animations.
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
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">Other Components</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>DialogHeader:</strong> Container for title and
                description
              </li>
              <li>
                <strong>DialogTitle:</strong> Accessible dialog title
              </li>
              <li>
                <strong>DialogDescription:</strong> Optional dialog description
              </li>
              <li>
                <strong>DialogFooter:</strong> Container for action buttons
              </li>
              <li>
                <strong>DialogClose:</strong> Element that closes the dialog
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
          <CardTitle>When to Use Dialog</CardTitle>
          <CardDescription>Best practices for dialog usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Dialog For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Complex forms that need focus</li>
              <li>• Detailed information or settings</li>
              <li>• Multi-step workflows</li>
              <li>• Image/media previews</li>
              <li>• Non-destructive actions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid Dialog For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Critical confirmations (use AlertDialog)</li>
              <li>• Simple tooltips or hints</li>
              <li>• Destructive actions without confirmation</li>
              <li>• Content that should be part of the main flow</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Guidelines</CardTitle>
          <CardDescription>
            Making dialogs accessible to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Focus Management</h4>
            <p className="text-muted-foreground text-sm">
              • Focus moves to dialog when opened
              <br />
              • Focus returns to trigger when closed
              <br />
              • Tab navigation stays within dialog
              <br />• Escape key closes the dialog
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Reader Support</h4>
            <p className="text-muted-foreground text-sm">
              Always include DialogTitle for screen reader users. Use
              DialogDescription for additional context.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              All interactive elements should be keyboard accessible with clear
              focus indicators.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Patterns</CardTitle>
          <CardDescription>
            Common dialog implementation patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Form Dialog</h4>
            <p className="text-muted-foreground text-sm">
              Use for complex forms that benefit from focused attention without
              page navigation.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Information Dialog</h4>
            <p className="text-muted-foreground text-sm">
              Present detailed information, help content, or explanatory
              material.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Preview Dialog</h4>
            <p className="text-muted-foreground text-sm">
              Show larger versions of content, image galleries, or detailed
              previews.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Settings Dialog</h4>
            <p className="text-muted-foreground text-sm">
              Organize application preferences and configuration options.
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
