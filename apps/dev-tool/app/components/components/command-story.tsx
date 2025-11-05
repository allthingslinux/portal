'use client';

import { useEffect, useState } from 'react';

import {
  Archive,
  AtSign,
  BookOpen,
  Calculator,
  Calendar,
  Code,
  Command as CommandIcon,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  File,
  Folder,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Share,
  Smile,
  Star,
  Trash,
  Upload,
  User,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@portal/ui/avatar';
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
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@portal/ui/command';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface CommandControlsProps {
  placeholder: string;
  emptyMessage: string;
  loop: boolean;
  shouldFilter: boolean;
  className: string;
  onPlaceholderChange: (placeholder: string) => void;
  onEmptyMessageChange: (message: string) => void;
  onLoopChange: (loop: boolean) => void;
  onShouldFilterChange: (shouldFilter: boolean) => void;
  onClassNameChange: (className: string) => void;
}

const examples = [
  {
    title: 'Command Palette Dialog',
    description:
      'Full-screen command palette triggered by keyboard shortcut, commonly used in editors and productivity apps',
    component: () => {
      const [open, setOpen] = useState(false);

      useEffect(() => {
        const down = (e: KeyboardEvent) => {
          if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setOpen((open) => !open);
          }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
      }, []);

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Command Palette</CardTitle>
            <CardDescription>
              Press{' '}
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                <span className="text-xs">⌘</span>K
              </kbd>{' '}
              to open the command palette
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setOpen(true)}
              className="w-full justify-start"
            >
              <CommandIcon className="mr-2 h-4 w-4" />
              Open Command Palette
            </Button>
          </CardContent>

          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={() => setOpen(false)}>
                  <File className="mr-2 h-4 w-4" />
                  <span>New File</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>New Folder</span>
                  <CommandShortcut>⇧⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search Files</span>
                  <CommandShortcut>⌘⇧F</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Recent Files">
                <CommandItem onSelect={() => setOpen(false)}>
                  <File className="mr-2 h-4 w-4" />
                  <span>components/ui/button.tsx</span>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <File className="mr-2 h-4 w-4" />
                  <span>lib/utils.ts</span>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <File className="mr-2 h-4 w-4" />
                  <span>app/page.tsx</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => setOpen(false)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘,</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </Card>
      );
    },
  },
  {
    title: 'File & Folder Browser',
    description:
      'Navigate and search through files and folders with live filtering',
    component: () => {
      const [selectedItem, setSelectedItem] = useState<string | null>(null);

      const items = [
        { type: 'folder', name: 'src', icon: Folder },
        { type: 'folder', name: 'components', icon: Folder },
        { type: 'folder', name: 'lib', icon: Folder },
        { type: 'file', name: 'package.json', icon: Code },
        { type: 'file', name: 'README.md', icon: BookOpen },
        { type: 'file', name: 'button.tsx', icon: Code },
        { type: 'file', name: 'utils.ts', icon: Code },
        { type: 'file', name: 'globals.css', icon: Code },
        { type: 'file', name: 'config.json', icon: Settings },
        { type: 'file', name: 'database.db', icon: Database },
      ];

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">File Explorer</CardTitle>
            <CardDescription>
              Search and navigate through your project files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command className="border">
              <CommandInput placeholder="Search files and folders..." />
              <CommandList>
                <CommandEmpty>No files found.</CommandEmpty>

                <CommandGroup heading="Project Files">
                  {items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <CommandItem
                        key={item.name}
                        onSelect={() => setSelectedItem(item.name)}
                        className="cursor-pointer"
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.type}
                        </Badge>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>

            {selectedItem && (
              <div className="bg-muted mt-4 rounded-md p-3">
                <p className="text-sm">
                  <strong>Selected:</strong> {selectedItem}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Team Member Search',
    description:
      'Search and select team members with avatars and role information',
    component: () => {
      const [selectedMember, setSelectedMember] = useState<string | null>(null);

      const teamMembers = [
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Product Manager',
          email: 'alice@company.com',
          avatar: 'AJ',
          status: 'online',
        },
        {
          id: '2',
          name: 'Bob Smith',
          role: 'Developer',
          email: 'bob@company.com',
          avatar: 'BS',
          status: 'away',
        },
        {
          id: '3',
          name: 'Carol Davis',
          role: 'Designer',
          email: 'carol@company.com',
          avatar: 'CD',
          status: 'online',
        },
        {
          id: '4',
          name: 'David Wilson',
          role: 'QA Engineer',
          email: 'david@company.com',
          avatar: 'DW',
          status: 'offline',
        },
        {
          id: '5',
          name: 'Eva Martinez',
          role: 'DevOps',
          email: 'eva@company.com',
          avatar: 'EM',
          status: 'online',
        },
        {
          id: '6',
          name: 'Frank Chen',
          role: 'Data Analyst',
          email: 'frank@company.com',
          avatar: 'FC',
          status: 'away',
        },
      ];

      const getStatusColor = (status: string) => {
        switch (status) {
          case 'online':
            return 'bg-green-500';
          case 'away':
            return 'bg-yellow-500';
          case 'offline':
            return 'bg-gray-400';
          default:
            return 'bg-gray-400';
        }
      };

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Find Team Members</CardTitle>
            <CardDescription>
              Search by name, role, or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command className="border">
              <CommandInput placeholder="Search team members..." />
              <CommandList>
                <CommandEmpty>No team members found.</CommandEmpty>

                <CommandGroup heading="Team Members">
                  {teamMembers.map((member) => (
                    <CommandItem
                      key={member.id}
                      onSelect={() => setSelectedMember(member.name)}
                      className="cursor-pointer"
                    >
                      <div className="flex w-full items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              'border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2',
                              getStatusColor(member.status),
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {member.role}
                          </p>
                        </div>
                        <Badge
                          variant={
                            member.status === 'online' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            {selectedMember && (
              <div className="bg-muted mt-4 rounded-md p-3">
                <p className="text-sm">
                  <strong>Selected member:</strong> {selectedMember}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Action Menu with Categories',
    description:
      'Organized command menu with different action categories and keyboard shortcuts',
    component: () => {
      const [lastAction, setLastAction] = useState<string | null>(null);

      return (
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>
              Organize and execute commands across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command className="border">
              <CommandInput placeholder="Search actions..." />
              <CommandList>
                <CommandEmpty>No actions found.</CommandEmpty>

                <CommandGroup heading="File Operations">
                  <CommandItem onSelect={() => setLastAction('New Document')}>
                    <File className="mr-2 h-4 w-4" />
                    <span>New Document</span>
                    <CommandShortcut>⌘N</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Upload File')}>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload File</span>
                    <CommandShortcut>⌘U</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Download')}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                    <CommandShortcut>⌘D</CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Edit">
                  <CommandItem onSelect={() => setLastAction('Copy')}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy</span>
                    <CommandShortcut>⌘C</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Edit')}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                    <CommandShortcut>⌘E</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Archive')}>
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Archive</span>
                    <CommandShortcut>⌘A</CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Communication">
                  <CommandItem onSelect={() => setLastAction('Send Message')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Send Message</span>
                    <CommandShortcut>⌘M</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Send Email')}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Send Email</span>
                    <CommandShortcut>⌘⇧M</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Share')}>
                    <Share className="mr-2 h-4 w-4" />
                    <span>Share</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Organize">
                  <CommandItem
                    onSelect={() => setLastAction('Add to Favorites')}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    <span>Add to Favorites</span>
                    <CommandShortcut>⌘⇧S</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setLastAction('Delete')}>
                    <Trash className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-600">Delete</span>
                    <CommandShortcut>⌘⌫</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>

            {lastAction && (
              <div className="bg-muted mt-4 rounded-md p-3">
                <p className="text-sm">
                  <strong>Action executed:</strong> {lastAction}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Contact Picker with Search',
    description:
      'Search through contacts with additional metadata and quick actions',
    component: () => {
      const [selectedContact, setSelectedContact] = useState<string | null>(
        null,
      );

      const contacts = [
        {
          id: '1',
          name: 'Alice Johnson',
          phone: '+1 (555) 123-4567',
          email: 'alice@example.com',
          company: 'Tech Corp',
        },
        {
          id: '2',
          name: 'Bob Smith',
          phone: '+1 (555) 234-5678',
          email: 'bob@example.com',
          company: 'Design Studio',
        },
        {
          id: '3',
          name: 'Carol Davis',
          phone: '+1 (555) 345-6789',
          email: 'carol@example.com',
          company: 'Marketing Inc',
        },
        {
          id: '4',
          name: 'David Wilson',
          phone: '+1 (555) 456-7890',
          email: 'david@example.com',
          company: 'Dev Agency',
        },
        {
          id: '5',
          name: 'Eva Martinez',
          phone: '+1 (555) 567-8901',
          email: 'eva@example.com',
          company: 'Startup XYZ',
        },
      ];

      return (
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Contact Search</CardTitle>
            <CardDescription>
              Find contacts by name, company, or contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command className="border">
              <CommandInput placeholder="Search contacts..." />
              <CommandList>
                <CommandEmpty>No contacts found.</CommandEmpty>

                <CommandGroup heading="Contacts">
                  {contacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      onSelect={() => setSelectedContact(contact.name)}
                      className="cursor-pointer"
                    >
                      <div className="flex w-full items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-xs">
                              {contact.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {contact.name}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <AtSign className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {contact.company}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Actions">
                  <CommandItem>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add New Contact</span>
                    <CommandShortcut>⌘N</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Import Contacts</span>
                    <CommandShortcut>⌘I</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>

            {selectedContact && (
              <div className="bg-muted mt-4 rounded-md p-3">
                <p className="text-sm">
                  <strong>Selected contact:</strong> {selectedContact}
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
  title: 'Command API Reference',
  description: 'Complete API documentation for the Command component family.',
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        'The controlled value of the command menu. Can be used for controlling which command is selected.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Event handler called when the selected command changes.',
    },
    {
      name: 'filter',
      type: '(value: string, search: string) => boolean | number',
      description:
        'Custom filter function. Return a number between 0-1 for score-based filtering.',
    },
    {
      name: 'shouldFilter',
      type: 'boolean',
      default: 'true',
      description: 'Whether to filter items based on search input.',
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'false',
      description:
        'Whether to loop through items when navigating with keyboard.',
    },
    {
      name: 'vimBindings',
      type: 'boolean',
      default: 'false',
      description: 'Enable vim-style keyboard navigation (j/k for up/down).',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: 'The default selected item when the component mounts.',
    },
  ],
  examples: [
    {
      title: 'Basic Command Menu',
      code: `import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@portal/ui/command';

<Command>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    },
    {
      title: 'Command Dialog',
      code: `import { CommandDialog } from '@portal/ui/command';

const [open, setOpen] = useState(false);

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandItem>Profile</CommandItem>
    <CommandItem>Settings</CommandItem>
  </CommandList>
</CommandDialog>`,
    },
    {
      title: 'With Icons and Shortcuts',
      code: `<CommandItem>
  <User className="mr-2 h-4 w-4" />
  <span>Profile</span>
  <CommandShortcut>⌘P</CommandShortcut>
</CommandItem>`,
    },
    {
      title: 'Custom Filtering',
      code: `<Command
  filter={(value, search) => {
    if (value.includes(search)) return 1;
    return 0;
  }}
>
  {/* Command content */}
</Command>`,
    },
  ],
};

const usageGuidelines = {
  title: 'Command Usage Guidelines',
  description:
    'Best practices for implementing command interfaces that provide excellent user experience.',
  guidelines: [
    {
      title: 'When to Use Command Components',
      items: [
        'Building application command palettes (⌘K style interfaces)',
        'Creating searchable lists of actions, files, or data',
        'Implementing keyboard-driven navigation and selection',
        'Building search interfaces with categorized results',
        'Creating quick switchers for projects, tabs, or workspaces',
      ],
    },
    {
      title: 'Content Organization',
      items: [
        'Group related commands using CommandGroup with clear headings',
        'Place most frequently used commands at the top',
        'Use CommandSeparator to visually separate different types of actions',
        'Keep command labels concise and action-oriented',
        'Provide keyboard shortcuts for power users when appropriate',
      ],
    },
    {
      title: 'Search and Filtering',
      items: [
        'Use clear, contextual placeholder text in search inputs',
        'Implement fuzzy search for better user experience',
        'Show helpful empty states when no results are found',
        'Consider search aliases for common terms',
        'Filter results in real-time as users type',
      ],
    },
    {
      title: 'Visual Design',
      items: [
        'Use consistent icons throughout the command interface',
        'Apply proper spacing and typography for readability',
        'Highlight the selected item clearly with appropriate contrast',
        'Show keyboard shortcuts using CommandShortcut component',
        'Use badges or labels to provide additional context',
      ],
    },
    {
      title: 'Keyboard Navigation',
      items: [
        'Support arrow keys for navigation up and down',
        'Use Enter to select the highlighted item',
        'Implement Escape to close command dialogs',
        'Consider vim bindings (j/k) for power users',
        'Enable loop navigation for seamless keyboard experience',
      ],
    },
    {
      title: 'Performance',
      items: [
        'Implement virtualization for large lists of commands',
        'Debounce search input to avoid excessive filtering',
        'Use lazy loading for dynamic command lists',
        'Cache frequently accessed command results',
        'Consider memoization for expensive filter operations',
      ],
    },
    {
      title: 'Accessibility',
      items: [
        'Command components include proper ARIA attributes automatically',
        'Ensure sufficient color contrast for all command items',
        'Provide clear focus indicators for keyboard navigation',
        'Use semantic headings for command groups',
        'Announce search results and selection changes to screen readers',
      ],
    },
  ],
};

export default function CommandStory() {
  const [controls, setControls] = useState({
    placeholder: 'Type a command or search...',
    emptyMessage: 'No results found.',
    loop: false,
    shouldFilter: true,
    className: '',
  });

  const generateCode = () => {
    const components = [
      'Command',
      'CommandInput',
      'CommandList',
      'CommandEmpty',
      'CommandGroup',
      'CommandItem',
    ];

    const importStatement = generateImportStatement(
      components,
      '@portal/ui/command',
    );
    const iconImport = generateImportStatement(
      ['User', 'Settings', 'CreditCard'],
      'lucide-react',
    );

    const commandProps = generatePropsString(
      {
        shouldFilter: !controls.shouldFilter ? false : undefined,
        loop: controls.loop ? true : undefined,
        className: controls.className || undefined,
      },
      {
        shouldFilter: true,
        loop: false,
      },
    );

    const inputProps = generatePropsString({
      placeholder:
        controls.placeholder !== 'Type a command or search...'
          ? controls.placeholder
          : undefined,
    });

    const emptyProps = generatePropsString({
      children:
        controls.emptyMessage !== 'No results found.'
          ? controls.emptyMessage
          : undefined,
    });

    const commandStructure = `<Command${commandProps}>\n  <CommandInput${inputProps} />\n  <CommandList>\n    <CommandEmpty${emptyProps ? ` ${emptyProps.slice(1)}` : ''}>No results found.</CommandEmpty>\n    <CommandGroup heading="Suggestions">\n      <CommandItem>\n        <User className="mr-2 h-4 w-4" />\n        <span>Profile</span>\n      </CommandItem>\n      <CommandItem>\n        <CreditCard className="mr-2 h-4 w-4" />\n        <span>Billing</span>\n      </CommandItem>\n      <CommandItem>\n        <Settings className="mr-2 h-4 w-4" />\n        <span>Settings</span>\n      </CommandItem>\n    </CommandGroup>\n  </CommandList>\n</Command>`;

    return `${importStatement}\n${iconImport}\n\n${commandStructure}`;
  };

  const controlsContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder</Label>
        <Input
          id="placeholder"
          value={controls.placeholder}
          onChange={(e) =>
            setControls((prev) => ({ ...prev, placeholder: e.target.value }))
          }
          placeholder="Enter placeholder text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emptyMessage">Empty Message</Label>
        <Input
          id="emptyMessage"
          value={controls.emptyMessage}
          onChange={(e) =>
            setControls((prev) => ({ ...prev, emptyMessage: e.target.value }))
          }
          placeholder="Enter empty message"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="loop">Loop Navigation</Label>
        <Switch
          id="loop"
          checked={controls.loop}
          onCheckedChange={(loop) => setControls((prev) => ({ ...prev, loop }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="shouldFilter">Should Filter</Label>
        <Switch
          id="shouldFilter"
          checked={controls.shouldFilter}
          onCheckedChange={(shouldFilter) =>
            setControls((prev) => ({ ...prev, shouldFilter }))
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
    <div className="p-6">
      <Command
        shouldFilter={controls.shouldFilter}
        loop={controls.loop}
        className={controls.className}
      >
        <CommandInput placeholder={controls.placeholder} />
        <CommandList>
          <CommandEmpty>{controls.emptyMessage}</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Search</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Command"
      previewDescription="Command menu with search and keyboard navigation"
      controlsTitle="Command Configuration"
      controlsDescription="Customize command behavior and appearance"
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
