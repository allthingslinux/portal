'use client';

import { useState } from 'react';

import {
  Archive,
  BookOpen,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileText,
  Folder,
  Github,
  Image,
  Keyboard,
  LogOut,
  Mail,
  Monitor,
  Moon,
  MoreHorizontal,
  Music,
  Palette,
  Plus,
  Settings,
  Share,
  Shield,
  Star,
  Sun,
  Trash,
  User,
  Video,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@portal/ui/avatar';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface DropdownMenuControlsProps {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  alignOffset: number;
  modal: boolean;
  className: string;
  onSideChange: (side: 'top' | 'right' | 'bottom' | 'left') => void;
  onAlignChange: (align: 'start' | 'center' | 'end') => void;
  onSideOffsetChange: (offset: number) => void;
  onAlignOffsetChange: (offset: number) => void;
  onModalChange: (modal: boolean) => void;
  onClassNameChange: (className: string) => void;
}

const examples = [
  {
    title: 'User Profile Menu',
    description:
      'Common user account menu with profile, settings, and logout options',
    component: () => {
      return (
        <div className="flex min-h-32 items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@username" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">John Doe</p>
                  <p className="text-muted-foreground text-xs leading-none">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard shortcuts</span>
                  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    title: 'Context Menu with Actions',
    description:
      'Right-click style context menu with file operations and shortcuts',
    component: () => {
      const [selectedAction, setSelectedAction] = useState<string | null>(null);

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Document Actions</CardTitle>
            <CardDescription>
              Right-click menu simulation for file operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Project Report.pdf</p>
                  <p className="text-muted-foreground text-xs">2.4 MB</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedAction('open')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Open</span>
                    <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setSelectedAction('edit')}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                    <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setSelectedAction('copy')}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy</span>
                    <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setSelectedAction('share')}>
                    <Share className="mr-2 h-4 w-4" />
                    <span>Share</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setSelectedAction('download')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setSelectedAction('star')}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Add to favorites</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setSelectedAction('archive')}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Archive</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setSelectedAction('delete')}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                    <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedAction && (
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm">
                  <strong>Action selected:</strong>{' '}
                  {selectedAction.charAt(0).toUpperCase() +
                    selectedAction.slice(1)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Multi-level Submenus',
    description: 'Nested dropdown menus with submenus for complex navigation',
    component: () => {
      return (
        <div className="flex min-h-48 items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Create Content</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
                <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Folder className="mr-2 h-4 w-4" />
                <span>Folder</span>
                <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Image className="mr-2 h-4 w-4" />
                  <span>Media</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem>
                    <Image className="mr-2 h-4 w-4" />
                    <span>Image</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Video className="mr-2 h-4 w-4" />
                    <span>Video</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Music className="mr-2 h-4 w-4" />
                    <span>Audio</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Design</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      <DropdownMenuItem>
                        <span>Figma File</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Sketch File</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Adobe XD File</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Template</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem>
                    <span>Meeting Notes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Project Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Bug Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Feature Request</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Github className="mr-2 h-4 w-4" />
                <span>Import from GitHub</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
  {
    title: 'Settings and Preferences',
    description: 'Toggle states and radio selections for user preferences',
    component: () => {
      const [showStatusBar, setShowStatusBar] = useState(true);
      const [showActivityBar, setShowActivityBar] = useState(false);
      const [showPanel, setShowPanel] = useState(false);
      const [theme, setTheme] = useState('system');

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Application Settings</CardTitle>
            <CardDescription>
              Configure your workspace preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm">Appearance & Layout</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel>View Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuCheckboxItem
                    checked={showStatusBar}
                    onCheckedChange={setShowStatusBar}
                  >
                    <Badge className="mr-2 h-3 w-3 rounded-full" />
                    Show Status Bar
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={showActivityBar}
                    onCheckedChange={setShowActivityBar}
                  >
                    <Badge className="mr-2 h-3 w-3 rounded-full" />
                    Show Activity Bar
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={showPanel}
                    onCheckedChange={setShowPanel}
                  >
                    <Badge className="mr-2 h-3 w-3 rounded-full" />
                    Show Panel
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>

                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="system">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Customize Theme</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Advanced Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-muted mt-4 rounded-md p-3">
              <p className="mb-2 text-sm font-medium">Current Settings:</p>
              <div className="space-y-1 text-xs">
                <div>Status Bar: {showStatusBar ? 'Visible' : 'Hidden'}</div>
                <div>
                  Activity Bar: {showActivityBar ? 'Visible' : 'Hidden'}
                </div>
                <div>Panel: {showPanel ? 'Visible' : 'Hidden'}</div>
                <div>
                  Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Team Collaboration Menu',
    description: 'Team management with member actions and collaboration tools',
    component: () => {
      const [selectedMember, setSelectedMember] = useState<string | null>(null);

      const teamMembers = [
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Admin',
          avatar: 'AJ',
          online: true,
        },
        {
          id: '2',
          name: 'Bob Smith',
          role: 'Editor',
          avatar: 'BS',
          online: false,
        },
        {
          id: '3',
          name: 'Carol Davis',
          role: 'Viewer',
          avatar: 'CD',
          online: true,
        },
      ];

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>
              Manage your team collaboration settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {member.online && (
                      <div className="border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {member.role}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setSelectedMember(member.name)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setSelectedMember(member.name)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Send Message</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Change Role</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-32">
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Viewer
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setSelectedMember(member.name)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Remove from team</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {selectedMember && (
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm">
                  <strong>Action for:</strong> {selectedMember}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
  },
];

const apiReference = {
  title: 'Dropdown Menu API Reference',
  description:
    'Complete API documentation for the Dropdown Menu component family.',
  props: [
    {
      name: 'modal',
      type: 'boolean',
      default: 'true',
      description:
        'When true, focus will be trapped inside the menu and other elements will not receive focus.',
    },
    {
      name: 'open',
      type: 'boolean',
      description: 'The controlled open state of the menu.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Event handler called when the open state of the menu changes.',
    },
    {
      name: 'side',
      type: '"top" | "right" | "bottom" | "left"',
      default: '"bottom"',
      description: 'The preferred side of the trigger to render against.',
    },
    {
      name: 'align',
      type: '"start" | "center" | "end"',
      default: '"center"',
      description: 'The preferred alignment against the trigger.',
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '0',
      description: 'The distance in pixels from the trigger.',
    },
    {
      name: 'alignOffset',
      type: 'number',
      default: '0',
      description: 'The skidding distance in pixels along the alignment axis.',
    },
    {
      name: 'avoidCollisions',
      type: 'boolean',
      default: 'true',
      description:
        'When true, overrides the side and align preferences to prevent collisions.',
    },
  ],
  examples: [
    {
      title: 'Basic Usage',
      code: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
    {
      title: 'With Checkboxes',
      code: `const [checked, setChecked] = useState(true);

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem
      checked={checked}
      onCheckedChange={setChecked}
    >
      Show Toolbar
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
    {
      title: 'With Radio Group',
      code: `const [value, setValue] = useState('option1');

<DropdownMenu>
  <DropdownMenuTrigger>Choose</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
      <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
    {
      title: 'With Submenus',
      code: `<DropdownMenu>
  <DropdownMenuTrigger>More</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Sub item 1</DropdownMenuItem>
        <DropdownMenuItem>Sub item 2</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
  ],
};

const usageGuidelines = {
  title: 'Dropdown Menu Usage Guidelines',
  description:
    'Best practices for implementing dropdown menus that provide excellent user experience.',
  guidelines: [
    {
      title: 'When to Use Dropdown Menus',
      items: [
        'Providing contextual actions for specific items or areas',
        'Organizing related commands or options in a compact space',
        'Creating user account menus with profile and settings options',
        'Building application menus with file, edit, view operations',
        'Offering bulk actions for selected items in lists or tables',
      ],
    },
    {
      title: 'Content Organization',
      items: [
        'Group related items together using separators',
        'Place most important or frequently used items at the top',
        'Use logical ordering (alphabetical, by frequency, or by workflow)',
        'Limit menu depth to 2-3 levels for usability',
        'Keep menu items concise with clear, action-oriented labels',
      ],
    },
    {
      title: 'Visual Design',
      items: [
        'Use consistent icons throughout the menu for better recognition',
        'Provide keyboard shortcuts for power users when appropriate',
        'Use separators to create visual groups and improve scanning',
        'Apply consistent spacing and alignment for professional appearance',
        'Consider destructive actions with warning colors (red for delete)',
      ],
    },
    {
      title: 'Interaction Patterns',
      items: [
        'Support both click and keyboard navigation (arrow keys, Enter, Esc)',
        "Close menu after item selection unless it's a checkbox/radio item",
        'Provide clear hover and focus states for all interactive elements',
        'Allow clicking outside the menu to close it',
        'Use appropriate positioning to avoid edge-of-screen clipping',
      ],
    },
    {
      title: 'Accessibility',
      items: [
        'Dropdown menus automatically include proper ARIA attributes',
        'Use semantic HTML and provide clear labels for screen readers',
        'Ensure sufficient color contrast for all menu items',
        'Support keyboard navigation with arrow keys and Enter/Space',
        'Announce state changes for checkbox and radio items',
      ],
    },
    {
      title: 'Advanced Features',
      items: [
        'Use checkbox items for toggleable options that persist',
        'Implement radio groups for mutually exclusive selections',
        'Add keyboard shortcuts for power users (display with DropdownMenuShortcut)',
        'Use submenus sparingly and only when logical grouping demands it',
        'Consider modal behavior for menus that should trap focus',
      ],
    },
  ],
};

export default function DropdownMenuStory() {
  const [controls, setControls] = useState({
    side: 'bottom' as 'top' | 'right' | 'bottom' | 'left',
    align: 'start' as 'start' | 'center' | 'end',
    sideOffset: 4,
    alignOffset: 0,
    modal: false,
    className: '',
  });

  const generateCode = () => {
    const components = [
      'DropdownMenu',
      'DropdownMenuTrigger',
      'DropdownMenuContent',
      'DropdownMenuItem',
      'DropdownMenuSeparator',
    ];

    const importStatement = generateImportStatement(
      components,
      '@portal/ui/dropdown-menu',
    );
    const buttonImport = generateImportStatement(
      ['Button'],
      '@portal/ui/button',
    );
    const iconImport = generateImportStatement(
      ['User', 'Settings', 'LogOut'],
      'lucide-react',
    );

    const contentProps = generatePropsString(
      {
        side: controls.side !== 'bottom' ? controls.side : undefined,
        align: controls.align !== 'start' ? controls.align : undefined,
        sideOffset: controls.sideOffset !== 4 ? controls.sideOffset : undefined,
        alignOffset:
          controls.alignOffset !== 0 ? controls.alignOffset : undefined,
        className: controls.className || undefined,
      },
      {
        side: 'bottom',
        align: 'start',
        sideOffset: 4,
        alignOffset: 0,
      },
    );

    const rootProps = generatePropsString({
      modal: controls.modal ? true : undefined,
    });

    const dropdownStructure = `<DropdownMenu${rootProps}>\n  <DropdownMenuTrigger asChild>\n    <Button variant="outline">Open Menu</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent${contentProps}>\n    <DropdownMenuItem>\n      <User className="mr-2 h-4 w-4" />\n      <span>Profile</span>\n    </DropdownMenuItem>\n    <DropdownMenuItem>\n      <Settings className="mr-2 h-4 w-4" />\n      <span>Settings</span>\n    </DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem>\n      <LogOut className="mr-2 h-4 w-4" />\n      <span>Log out</span>\n    </DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`;

    return `${importStatement}\n${buttonImport}\n${iconImport}\n\n${dropdownStructure}`;
  };

  const controlsContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="side">Side</Label>
        <Select
          value={controls.side}
          onValueChange={(value: 'top' | 'right' | 'bottom' | 'left') =>
            setControls((prev) => ({ ...prev, side: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
            <SelectItem value="left">Left</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="align">Align</Label>
        <Select
          value={controls.align}
          onValueChange={(value: 'start' | 'center' | 'end') =>
            setControls((prev) => ({ ...prev, align: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sideOffset">Side Offset</Label>
        <Input
          id="sideOffset"
          type="number"
          value={controls.sideOffset}
          onChange={(e) =>
            setControls((prev) => ({
              ...prev,
              sideOffset: parseInt(e.target.value) || 0,
            }))
          }
          min="0"
          max="20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alignOffset">Align Offset</Label>
        <Input
          id="alignOffset"
          type="number"
          value={controls.alignOffset}
          onChange={(e) =>
            setControls((prev) => ({
              ...prev,
              alignOffset: parseInt(e.target.value) || 0,
            }))
          }
          min="-20"
          max="20"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="modal">Modal</Label>
        <Switch
          id="modal"
          checked={controls.modal}
          onCheckedChange={(modal) =>
            setControls((prev) => ({ ...prev, modal }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Additional Classes</Label>
        <Input
          id="className"
          value={controls.className}
          onChange={(e) =>
            setControls((prev) => ({ ...prev, className: e.target.value }))
          }
          placeholder="Additional CSS classes"
        />
      </div>
    </div>
  );

  const previewContent = (
    <div className="flex justify-center p-6">
      <DropdownMenu modal={controls.modal}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={controls.side}
          align={controls.align}
          sideOffset={controls.sideOffset}
          alignOffset={controls.alignOffset}
          className={controls.className}
        >
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Dropdown Menu"
      previewDescription="Contextual menu with positioning and behavior options"
      controlsTitle="Menu Configuration"
      controlsDescription="Customize dropdown positioning and behavior"
      generatedCode={generateCode()}
      examples={
        <div className="space-y-8">
          {examples.map((example, index) => (
            <div key={index}>
              <h3 className="mb-4 text-lg font-semibold">{example.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {example.description}
              </p>
              <div className="flex justify-center">
                <example.component />
              </div>
            </div>
          ))}
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">{apiReference.title}</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {apiReference.description}
            </p>

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
                  {apiReference.props.map((prop, index) => (
                    <tr key={index} className="border-border/50 border-b">
                      <td className="p-2 font-mono">{prop.name}</td>
                      <td className="p-2 font-mono">{prop.type}</td>
                      <td className="p-2">{(prop as any).default || '-'}</td>
                      <td className="p-2">{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Code Examples</h3>
            {apiReference.examples.map((example, index) => (
              <div key={index}>
                <h4 className="mb-2 text-base font-medium">{example.title}</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      usageGuidelines={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {usageGuidelines.title}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {usageGuidelines.description}
            </p>
          </div>

          {usageGuidelines.guidelines.map((section, index) => (
            <div key={index}>
              <h4 className="mb-3 text-base font-semibold">{section.title}</h4>
              <ul className="space-y-1 text-sm">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="mt-1.5 mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      }
    />
  );
}
