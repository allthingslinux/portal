'use client';

import React from 'react';

import dynamic from 'next/dynamic';

import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Command,
  Cookie,
  Database,
  FileText,
  Heading as HeadingIcon,
  Info,
  KeyRound,
  Layers,
  Layout,
  Loader2,
  MessageSquare,
  MousePointer,
  Navigation,
  Package,
  Palette,
  PieChart,
  Edit3 as TextIcon,
  MessageSquare as ToastIcon,
  ToggleLeft,
  Type,
  Upload,
} from 'lucide-react';

import { LoadingFallback } from '../components/loading-fallback';

const AlertStory = dynamic(
  () =>
    import('../components/alert-story').then((mod) => ({
      default: mod.AlertStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const BorderedNavigationMenuStory = dynamic(
  () =>
    import('../components/bordered-navigation-menu-story').then((mod) => ({
      default: mod.BorderedNavigationMenuStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const BadgeStory = dynamic(
  () =>
    import('../components/badge-story').then((mod) => ({
      default: mod.BadgeStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const ButtonStory = dynamic(
  () =>
    import('../components/button-story').then((mod) => ({
      default: mod.ButtonStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const ButtonGroupStory = dynamic(
  () =>
    import('../components/button-group-story').then((mod) => ({
      default: mod.ButtonGroupStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const CardStory = dynamic(
  () =>
    import('../components/card-story').then((mod) => ({
      default: mod.CardStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const DataTableStory = dynamic(
  () =>
    import('../components/data-table-story').then((mod) => ({
      default: mod.DataTableStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const DropdownMenuStory = dynamic(
  () =>
    import('../components/dropdown-menu-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const InputStory = dynamic(
  () =>
    import('../components/input-story').then((mod) => ({
      default: mod.InputStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const SelectStory = dynamic(
  () =>
    import('../components/select-story').then((mod) => ({
      default: mod.SelectStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const SwitchStory = dynamic(
  () =>
    import('../components/switch-story').then((mod) => ({
      default: mod.SwitchStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const DialogStory = dynamic(
  () =>
    import('../components/dialog-story').then((mod) => ({
      default: mod.DialogStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const AlertDialogStory = dynamic(
  () =>
    import('../components/alert-dialog-story').then((mod) => ({
      default: mod.AlertDialogStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const TooltipStory = dynamic(
  () =>
    import('../components/tooltip-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const ProgressStory = dynamic(
  () =>
    import('../components/progress-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const CardButtonStory = dynamic(
  () =>
    import('../components/card-button-story').then((mod) => ({
      default: mod.CardButtonStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const LoadingOverlayStory = dynamic(
  () =>
    import('../components/loading-overlay-story').then((mod) => ({
      default: mod.LoadingOverlayStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const StepperStory = dynamic(
  () =>
    import('../components/stepper-story').then((mod) => ({
      default: mod.StepperStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const CookieBannerStory = dynamic(
  () =>
    import('../components/cookie-banner-story').then((mod) => ({
      default: mod.CookieBannerStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const FileUploaderStory = dynamic(
  () =>
    import('../components/file-uploader-story').then((mod) => ({
      default: mod.FileUploaderStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const LoadingSpinnerStory = dynamic(
  () =>
    import('../components/spinner-story').then((mod) => ({
      default: mod.SpinnerStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const TabsStory = dynamic(
  () =>
    import('../components/tabs-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const ChartStory = dynamic(
  () =>
    import('../components/chart-story').then((mod) => ({
      default: mod.ChartStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const CalendarStory = dynamic(
  () =>
    import('../components/calendar-story').then((mod) => ({
      default: mod.CalendarStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const BreadcrumbStory = dynamic(
  () =>
    import('../components/breadcrumb-story').then((mod) => ({
      default: mod.BreadcrumbStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const FormStory = dynamic(
  () =>
    import('../components/form-story').then((mod) => ({
      default: mod.FormStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const FieldStory = dynamic(
  () =>
    import('../components/field-story').then((mod) => ({
      default: mod.FieldStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const HeadingStory = dynamic(
  () =>
    import('../components/heading-story').then((mod) => ({
      default: mod.HeadingStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const KbdStory = dynamic(
  () =>
    import('../components/kbd-story').then((mod) => ({
      default: mod.KbdStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const InputOTPStory = dynamic(
  () =>
    import('../components/input-otp-story').then((mod) => ({
      default: mod.InputOTPStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const InputGroupStory = dynamic(
  () =>
    import('../components/input-group-story').then((mod) => ({
      default: mod.InputGroupStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const RadioGroupStory = dynamic(
  () =>
    import('../components/radio-group-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const SkeletonStory = dynamic(
  () =>
    import('../components/skeleton-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const SonnerStory = dynamic(
  () =>
    import('../components/sonner-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const TextareaStory = dynamic(
  () =>
    import('../components/textarea-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const CommandStory = dynamic(
  () =>
    import('../components/command-story').then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const SimpleTableStory = dynamic(
  () =>
    import('../components/simple-data-table-story').then((mod) => ({
      default: mod.SimpleDataTableStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

const ItemStory = dynamic(
  () =>
    import('../components/item-story').then((mod) => ({
      default: mod.ItemStory,
    })),
  {
    loading: () => <LoadingFallback />,
  },
);

// Component type definition
export interface ComponentInfo {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  status: 'stable' | 'beta' | 'deprecated';
  component: React.ComponentType;
  sourceFile: string;
  props: string[];
  icon: React.ComponentType<{ className?: string }>;
}

// Component registry
export const COMPONENTS_REGISTRY: ComponentInfo[] = [
  // Forms Components
  {
    id: 'input',
    name: 'Input',
    category: 'Forms',
    subcategory: 'Fields',
    description: 'Text input field for collecting user data',
    status: 'stable',
    component: InputStory,
    sourceFile: '@portal/ui/input',
    props: [
      'type',
      'placeholder',
      'disabled',
      'required',
      'value',
      'onChange',
      'className',
    ],
    icon: Type,
  },

  {
    id: 'field',
    name: 'Field',
    category: 'Forms',
    subcategory: 'Structure',
    description:
      'Primitive set for arranging labels, descriptions, and validation messaging.',
    status: 'stable',
    component: FieldStory,
    sourceFile: '@portal/ui/field',
    props: ['orientation', 'className', 'data-invalid'],
    icon: FileText,
  },

  {
    id: 'input-group',
    name: 'Input Group',
    category: 'Forms',
    subcategory: 'Fields',
    description:
      'Wrap inputs with inline addons, keyboard hints, and primary actions.',
    status: 'stable',
    component: InputGroupStory,
    sourceFile: '@portal/ui/input-group',
    props: ['className', 'role', 'children'],
    icon: ToggleLeft,
  },

  {
    id: 'card-button',
    name: 'Card Button',
    category: 'Interaction',
    subcategory: 'Controls',
    description: 'Button component with card-like styling',
    status: 'stable',
    component: CardButtonStory,
    sourceFile: '@portal/ui/card-button',
    props: ['asChild', 'className', 'children', 'onClick', 'disabled'],
    icon: MousePointer,
  },

  {
    id: 'loading-overlay',
    name: 'Loading Overlay',
    category: 'Feedback',
    subcategory: 'Controls',
    description: 'Overlay component with loading spinner',
    status: 'stable',
    component: LoadingOverlayStory,
    sourceFile: '@portal/ui/loading-overlay',
    props: ['children', 'className', 'spinnerClassName', 'fullPage'],
    icon: Loader2,
  },

  {
    id: 'stepper',
    name: 'Stepper',
    category: 'Forms',
    subcategory: 'Controls',
    description: 'Stepper component with customizable steps',
    status: 'stable',
    component: StepperStory,
    sourceFile: '@portal/ui/stepper',
    props: ['steps', 'currentStep', 'variant'],
    icon: ChevronDown,
  },

  {
    id: 'bordered-navigation-menu',
    name: 'Bordered Navigation Menu',
    category: 'Navigation',
    subcategory: 'Menus',
    description: 'Bordered navigation menu component with customizable options',
    status: 'stable',
    component: BorderedNavigationMenuStory,
    sourceFile: '@portal/ui/bordered-navigation-menu',
    props: ['path', 'label', 'end', 'active', 'className', 'buttonClassName'],
    icon: Navigation,
  },

  {
    id: 'cookie-banner',
    name: 'Cookie Banner',
    category: 'Feedback',
    subcategory: 'Modals',
    description: 'Cookie banner component with customizable options',
    status: 'stable',
    component: CookieBannerStory,
    sourceFile: '@portal/ui/cookie-banner',
    props: [],
    icon: Cookie,
  },

  {
    id: 'file-uploader',
    name: 'File Uploader',
    category: 'Forms',
    subcategory: 'Controls',
    description: 'File uploader component with customizable options',
    status: 'stable',
    component: FileUploaderStory,
    sourceFile: '@portal/ui/file-uploader',
    props: [
      'maxFiles',
      'bucketName',
      'path',
      'allowedMimeTypes',
      'maxFileSize',
      'client',
      'onUploadSuccess',
      'cacheControl',
      'className',
    ],
    icon: Upload,
  },

  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    category: 'Feedback',
    subcategory: 'Controls',
    description: 'Loading spinner component',
    status: 'stable',
    component: LoadingSpinnerStory,
    sourceFile: '@portal/ui/spinner',
    props: ['className', 'children'],
    icon: Loader2,
  },

  {
    id: 'select',
    name: 'Select',
    category: 'Forms',
    subcategory: 'Fields',
    description: 'Dropdown selection component with grouping support',
    status: 'stable',
    component: SelectStory,
    sourceFile: '@portal/ui/select',
    props: ['value', 'onValueChange', 'disabled', 'required', 'placeholder'],
    icon: ChevronDown,
  },

  {
    id: 'dropdown-menu',
    name: 'Dropdown Menu',
    category: 'Forms',
    subcategory: 'Controls',
    description: 'Dropdown menu component with customizable options',
    status: 'stable',
    component: DropdownMenuStory,
    sourceFile: '@portal/ui/dropdown-menu',
    props: ['value', 'onValueChange', 'disabled', 'required', 'placeholder'],
    icon: ChevronDown,
  },

  {
    id: 'switch',
    name: 'Switch',
    category: 'Forms',
    subcategory: 'Controls',
    description: 'Toggle switch for boolean states and settings',
    status: 'stable',
    component: SwitchStory,
    sourceFile: '@portal/ui/switch',
    props: [
      'checked',
      'onCheckedChange',
      'disabled',
      'required',
      'name',
      'value',
    ],
    icon: ToggleLeft,
  },

  {
    id: 'calendar',
    name: 'Calendar',
    category: 'Forms',
    subcategory: 'Date & Time',
    description:
      'Date picker component for selecting single dates, date ranges, or multiple dates',
    status: 'stable',
    component: CalendarStory,
    sourceFile: '@portal/ui/calendar',
    props: [
      'mode',
      'selected',
      'onSelect',
      'captionLayout',
      'numberOfMonths',
      'showOutsideDays',
      'showWeekNumber',
      'disabled',
      'buttonVariant',
    ],
    icon: CalendarIcon,
  },

  {
    id: 'form',
    name: 'Form',
    category: 'Forms',
    subcategory: 'Validation',
    description:
      'Form components with React Hook Form integration and Zod validation',
    status: 'stable',
    component: FormStory,
    sourceFile: '@portal/ui/form',
    props: ['control', 'name', 'render', 'defaultValue', 'rules'],
    icon: FileText,
  },

  {
    id: 'input-otp',
    name: 'Input OTP',
    category: 'Forms',
    subcategory: 'Security',
    description:
      'One-time password input with customizable length, patterns, and grouping',
    status: 'stable',
    component: InputOTPStory,
    sourceFile: '@portal/ui/input-otp',
    props: [
      'maxLength',
      'value',
      'onChange',
      'pattern',
      'disabled',
      'autoFocus',
    ],
    icon: KeyRound,
  },

  {
    id: 'radio-group',
    name: 'Radio Group',
    category: 'Forms',
    subcategory: 'Controls',
    description:
      'Single-selection input control with enhanced labels and customizable layouts',
    status: 'stable',
    component: RadioGroupStory,
    sourceFile: '@portal/ui/radio-group',
    props: [
      'value',
      'onValueChange',
      'disabled',
      'name',
      'required',
      'orientation',
    ],
    icon: CircleDot,
  },

  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    subcategory: 'Loading',
    description:
      'Animated loading placeholder that preserves layout during content loading',
    status: 'stable',
    component: SkeletonStory,
    sourceFile: '@portal/ui/skeleton',
    props: ['className'],
    icon: Loader2,
  },

  {
    id: 'sonner',
    name: 'Sonner',
    category: 'Feedback',
    subcategory: 'Notifications',
    description:
      'Toast notification system with promise support and rich interactions',
    status: 'stable',
    component: SonnerStory,
    sourceFile: '@portal/ui/sonner',
    props: ['position', 'theme', 'richColors', 'expand', 'visibleToasts'],
    icon: ToastIcon,
  },

  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Forms',
    subcategory: 'Fields',
    description:
      'Multi-line text input with customizable resize behavior and validation support',
    status: 'stable',
    component: TextareaStory,
    sourceFile: '@portal/ui/textarea',
    props: [
      'value',
      'onChange',
      'placeholder',
      'disabled',
      'readOnly',
      'required',
      'rows',
      'cols',
      'maxLength',
    ],
    icon: TextIcon,
  },

  // Feedback Components
  {
    id: 'alert',
    name: 'Alert',
    category: 'Feedback',
    subcategory: 'Messages',
    description: 'Contextual feedback messages for user actions',
    status: 'stable',
    component: AlertStory,
    sourceFile: '@portal/ui/alert',
    props: ['variant', 'className', 'children'],
    icon: AlertCircle,
  },

  {
    id: 'dialog',
    name: 'Dialog',
    category: 'Feedback',
    subcategory: 'Modals',
    description: 'Modal dialog for forms, content, and user interactions',
    status: 'stable',
    component: DialogStory,
    sourceFile: '@portal/ui/dialog',
    props: ['open', 'onOpenChange', 'modal'],
    icon: MessageSquare,
  },

  {
    id: 'alert-dialog',
    name: 'Alert Dialog',
    category: 'Feedback',
    subcategory: 'Modals',
    description: 'Modal dialog for critical confirmations and alerts',
    status: 'stable',
    component: AlertDialogStory,
    sourceFile: '@portal/ui/alert-dialog',
    props: ['open', 'onOpenChange'],
    icon: AlertTriangle,
  },

  {
    id: 'command',
    name: 'Command',
    category: 'Forms',
    subcategory: 'Controls',
    description:
      'Command palette for executing actions and commands with search and keyboard navigation',
    status: 'stable',
    component: CommandStory,
    sourceFile: '@portal/ui/command',
    props: [
      'value',
      'onValueChange',
      'filter',
      'shouldFilter',
      'loop',
      'vimBindings',
      'defaultValue',
    ],
    icon: Command,
  },

  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Feedback',
    subcategory: 'Overlays',
    description: 'Contextual information overlay triggered by hover or focus',
    status: 'stable',
    component: TooltipStory,
    sourceFile: '@portal/ui/tooltip',
    props: [
      'delayDuration',
      'skipDelayDuration',
      'disableHoverableContent',
      'open',
      'onOpenChange',
    ],
    icon: Info,
  },

  {
    id: 'progress',
    name: 'Progress',
    category: 'Feedback',
    subcategory: 'Status',
    description: 'Visual indicator showing completion progress of tasks',
    status: 'stable',
    component: ProgressStory,
    sourceFile: '@portal/ui/progress',
    props: ['value', 'max', 'getValueLabel', 'className'],
    icon: BarChart3,
  },

  // Display Components
  {
    id: 'chart',
    name: 'Chart',
    category: 'Display',
    subcategory: 'Data Visualization',
    description: 'Data visualization components built on top of Recharts',
    status: 'stable',
    component: ChartStory,
    sourceFile: '@portal/ui/chart',
    props: ['config', 'children', 'className'],
    icon: PieChart,
  },

  {
    id: 'heading',
    name: 'Heading',
    category: 'Display',
    subcategory: 'Typography',
    description:
      'Semantic heading component with responsive typography scaling',
    status: 'stable',
    component: HeadingStory,
    sourceFile: '@portal/ui/heading',
    props: ['level', 'children', 'className'],
    icon: HeadingIcon,
  },

  {
    id: 'kbd',
    name: 'Keyboard Key',
    category: 'Display',
    subcategory: 'Helpers',
    description:
      'Display keyboard shortcuts inline, in tooltips, or within helper text.',
    status: 'stable',
    component: KbdStory,
    sourceFile: '@portal/ui/kbd',
    props: ['className', 'children'],
    icon: Command,
  },

  // Interaction Components
  {
    id: 'button',
    name: 'Button',
    category: 'Interaction',
    subcategory: 'Actions',
    description: 'Clickable element that triggers actions',
    status: 'stable',
    component: ButtonStory,
    sourceFile: '@portal/ui/button',
    props: ['variant', 'size', 'disabled', 'onClick', 'className', 'children'],
    icon: MousePointer,
  },

  {
    id: 'button-group',
    name: 'Button Group',
    category: 'Interaction',
    subcategory: 'Actions',
    description:
      'Coordinate related buttons, dropdowns, and inputs within a shared toolbar.',
    status: 'stable',
    component: ButtonGroupStory,
    sourceFile: '@portal/ui/button-group',
    props: ['orientation', 'className', 'children'],
    icon: CircleDot,
  },

  // Layout Components
  {
    id: 'card',
    name: 'Card',
    category: 'Layout',
    subcategory: 'Containers',
    description: 'Container for content with optional header and footer',
    status: 'stable',
    component: CardStory,
    sourceFile: '@portal/ui/card',
    props: ['className', 'children'],
    icon: Layout,
  },

  {
    id: 'item',
    name: 'Item',
    category: 'Layout',
    subcategory: 'Lists',
    description:
      'Composable list item primitive with media, actions, and metadata slots.',
    status: 'stable',
    component: ItemStory,
    sourceFile: '@portal/ui/item',
    props: ['variant', 'size', 'asChild', 'className'],
    icon: Layers,
  },

  {
    id: 'badge',
    name: 'Badge',
    category: 'Display',
    subcategory: 'Indicators',
    description: 'Small labeled status or category indicator',
    status: 'stable',
    component: BadgeStory,
    sourceFile: '@portal/ui/badge',
    props: ['variant', 'className', 'children'],
    icon: Palette,
  },

  // Data Components
  {
    id: 'simple-data-table',
    name: 'Table',
    category: 'Data',
    subcategory: 'Tables',
    description: 'Simple table component with basic TanStack Table features',
    status: 'stable',
    component: SimpleTableStory,
    sourceFile: '@portal/ui/data-table',
    props: ['data', 'columns'],
    icon: Database,
  },
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'Data',
    subcategory: 'Tables',
    description: 'Advanced table with sorting, filtering, and pagination',
    status: 'stable',
    component: DataTableStory,
    sourceFile: '@portal/ui/enhanced-data-table',
    props: ['data', 'columns', 'pageSize', 'sorting', 'filtering'],
    icon: Database,
  },

  // Navigation Components
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    subcategory: 'Hierarchy',
    description:
      'Navigation component showing the hierarchical path to the current page',
    status: 'stable',
    component: BreadcrumbStory,
    sourceFile: '@portal/ui/breadcrumb',
    props: ['separator', 'asChild', 'href', 'className'],
    icon: ChevronRight,
  },

  {
    id: 'empty-state',
    name: 'Empty State',
    category: 'Feedback',
    subcategory: 'Messages',
    description:
      'Empty state component for displaying when no data is available',
    status: 'stable',
    component: dynamic(
      () =>
        import('../components/empty-state-story').then((mod) => ({
          default: mod.EmptyStateStory,
        })),
      {
        loading: () => <LoadingFallback />,
      },
    ),
    sourceFile: '@portal/ui/empty-state',
    props: ['className', 'children'],
    icon: Package,
  },

  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    subcategory: 'Organization',
    description: 'Tabbed navigation interface for organizing related content',
    status: 'stable',
    component: TabsStory,
    sourceFile: '@portal/ui/tabs',
    props: [
      'defaultValue',
      'value',
      'onValueChange',
      'orientation',
      'dir',
      'activationMode',
    ],
    icon: Layers,
  },
];

// Enhanced category system with icons and descriptions
export const categoryInfo = {
  Forms: {
    icon: Type,
    description: 'Components for collecting and validating user input',
    color: 'bg-cyan-500',
  },
  Interaction: {
    icon: MousePointer,
    description: 'Components that handle user interactions',
    color: 'bg-blue-500',
  },
  Layout: {
    icon: Layout,
    description: 'Components for structuring and organizing content',
    color: 'bg-green-500',
  },
  Display: {
    icon: Palette,
    description: 'Components for displaying information and status',
    color: 'bg-purple-500',
  },
  Data: {
    icon: Database,
    description: 'Components for displaying and manipulating data',
    color: 'bg-orange-500',
  },
  Feedback: {
    icon: AlertCircle,
    description: 'Components for providing user feedback',
    color: 'bg-red-500',
  },
  Navigation: {
    icon: Navigation,
    description: 'Components for site and app navigation',
    color: 'bg-indigo-500',
  },
} as const;

export const categories = [
  ...new Set(COMPONENTS_REGISTRY.map((c) => c.category)),
];
