'use client';

import { useState } from 'react';

import {
  Bell,
  Eye,
  FileText,
  Globe,
  Image,
  Settings,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Checkbox } from '@portal/ui/checkbox';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface CheckboxControlsProps {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  size: 'sm' | 'default' | 'lg';
  className: string;
  onCheckedChange: (checked: boolean) => void;
  onIndeterminateChange: (indeterminate: boolean) => void;
  onDisabledChange: (disabled: boolean) => void;
  onRequiredChange: (required: boolean) => void;
  onSizeChange: (size: 'sm' | 'default' | 'lg') => void;
  onClassNameChange: (className: string) => void;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  default: 'h-4 w-4',
  lg: 'h-5 w-5',
};

function CheckboxPlayground({
  checked,
  indeterminate,
  disabled,
  required,
  size,
  className,
  onCheckedChange,
}: CheckboxControlsProps) {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="playground-checkbox"
          checked={indeterminate ? 'indeterminate' : checked}
          onCheckedChange={(value) => {
            if (typeof value === 'boolean') {
              onCheckedChange(value);
            }
          }}
          disabled={disabled}
          required={required}
          className={cn(sizeClasses[size], className)}
        />
        <Label
          htmlFor="playground-checkbox"
          className={cn(
            'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            disabled && 'opacity-70',
          )}
        >
          {indeterminate
            ? 'Indeterminate checkbox'
            : checked
              ? 'Checked checkbox'
              : 'Unchecked checkbox'}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      </div>
    </div>
  );
}

const examples = [
  {
    title: 'Basic Checkbox States',
    description:
      'Standard checkbox states including checked, unchecked, indeterminate, and disabled',
    component: () => {
      const [basicChecked, setBasicChecked] = useState(false);
      const [indeterminateChecked, setIndeterminateChecked] = useState<
        boolean | 'indeterminate'
      >('indeterminate');

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Checkbox States</CardTitle>
            <CardDescription>
              Different states and behaviors of checkboxes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="unchecked" checked={false} />
              <Label htmlFor="unchecked">Unchecked</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="checked" checked={true} />
              <Label htmlFor="checked">Checked</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="indeterminate"
                checked={indeterminateChecked}
                onCheckedChange={setIndeterminateChecked}
              />
              <Label htmlFor="indeterminate">
                Indeterminate (partially selected)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="disabled-unchecked" disabled checked={false} />
              <Label htmlFor="disabled-unchecked" className="opacity-70">
                Disabled unchecked
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="disabled-checked" disabled checked={true} />
              <Label htmlFor="disabled-checked" className="opacity-70">
                Disabled checked
              </Label>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="interactive"
                checked={basicChecked}
                onCheckedChange={setBasicChecked}
              />
              <Label htmlFor="interactive">
                Interactive checkbox - {basicChecked ? 'Checked' : 'Unchecked'}
              </Label>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Form Integration',
    description:
      'Checkboxes in forms with validation, grouping, and different use cases',
    component: () => {
      const [formData, setFormData] = useState({
        acceptTerms: false,
        receiveNewsletter: false,
        receivePromotions: false,
        enableNotifications: true,
        enableTwoFactor: false,
      });

      const [submitted, setSubmitted] = useState(false);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      };

      const isValid = formData.acceptTerms;

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Account Settings Form</CardTitle>
            <CardDescription>
              Configure your account preferences and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Email Preferences</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.receiveNewsletter}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiveNewsletter: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="newsletter">Receive newsletter</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promotions"
                    checked={formData.receivePromotions}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        receivePromotions: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="promotions">Receive promotional emails</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Security</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={formData.enableNotifications}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        enableNotifications: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="notifications">
                    Enable push notifications
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="two-factor"
                    checked={formData.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        enableTwoFactor: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="two-factor">
                    Enable two-factor authentication
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Recommended
                    </Badge>
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, acceptTerms: !!checked }))
                  }
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the{' '}
                  <span className="cursor-pointer underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="cursor-pointer underline">
                    Privacy Policy
                  </span>
                  <span className="ml-1 text-red-500">*</span>
                </Label>
              </div>

              <Button type="submit" disabled={!isValid} className="w-full">
                {submitted ? 'Settings Saved!' : 'Save Settings'}
              </Button>

              {submitted && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-800">
                    Your settings have been successfully updated!
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Hierarchical Selection',
    description:
      'Parent-child checkbox relationships with indeterminate states',
    component: () => {
      const [selections, setSelections] = useState({
        all: false as boolean | 'indeterminate',
        documents: {
          parent: false as boolean | 'indeterminate',
          children: {
            reports: false,
            presentations: true,
            spreadsheets: false,
          },
        },
        media: {
          parent: true as boolean | 'indeterminate',
          children: {
            images: true,
            videos: true,
            audio: true,
          },
        },
        settings: {
          parent: false as boolean | 'indeterminate',
          children: {
            preferences: false,
            security: false,
            notifications: false,
          },
        },
      });

      const updateParentState = (
        category:
          | keyof typeof selections.documents
          | keyof typeof selections.media
          | keyof typeof selections.settings,
      ) => {
        const categoryData = selections[
          category as keyof typeof selections
        ] as {
          parent: boolean | 'indeterminate';
          children: Record<string, boolean>;
        };
        const children = Object.values(categoryData.children);
        const checkedCount = children.filter(Boolean).length;

        let parentState: boolean | 'indeterminate';
        if (checkedCount === 0) parentState = false;
        else if (checkedCount === children.length) parentState = true;
        else parentState = 'indeterminate';

        return parentState;
      };

      const updateAllState = () => {
        const allCategories = [
          selections.documents,
          selections.media,
          selections.settings,
        ];
        const allCheckedStates = allCategories.map((cat) => cat.parent);
        const trueCount = allCheckedStates.filter(
          (state) => state === true,
        ).length;
        const indeterminateCount = allCheckedStates.filter(
          (state) => state === 'indeterminate',
        ).length;

        if (trueCount === allCategories.length) return true;
        if (trueCount === 0 && indeterminateCount === 0) return false;
        return 'indeterminate';
      };

      const handleChildChange = (
        category: 'documents' | 'media' | 'settings',
        child: string,
        checked: boolean,
      ) => {
        const newSelections = { ...selections };
        (newSelections[category].children as any)[child] = checked;
        newSelections[category].parent = updateParentState(category);
        newSelections.all = updateAllState();
        setSelections(newSelections);
      };

      const handleParentChange = (
        category: 'documents' | 'media' | 'settings',
        checked: boolean | 'indeterminate',
      ) => {
        if (checked === 'indeterminate') return;

        const newSelections = { ...selections };
        newSelections[category].parent = checked;

        Object.keys(newSelections[category].children).forEach((key) => {
          (newSelections[category].children as any)[key] = checked;
        });

        newSelections.all = updateAllState();
        setSelections(newSelections);
      };

      const handleAllChange = (checked: boolean | 'indeterminate') => {
        if (checked === 'indeterminate') return;

        const newSelections = { ...selections };
        newSelections.all = checked;

        (['documents', 'media', 'settings'] as const).forEach((category) => {
          newSelections[category].parent = checked;
          Object.keys(newSelections[category].children).forEach((key) => {
            (newSelections[category].children as any)[key] = checked;
          });
        });

        setSelections(newSelections);
      };

      // Update parent states based on children
      React.useEffect(() => {
        const newSelections = { ...selections };
        (['documents', 'media', 'settings'] as const).forEach((category) => {
          newSelections[category].parent = updateParentState(category);
        });
        newSelections.all = updateAllState();
        setSelections(newSelections);
      }, []);

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">File Backup Selection</CardTitle>
            <CardDescription>
              Choose which files to include in your backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 font-medium">
              <Checkbox
                id="select-all"
                checked={selections.all}
                onCheckedChange={handleAllChange}
              />
              <Label htmlFor="select-all">Select All</Label>
            </div>

            <div className="ml-6 space-y-4">
              {/* Documents */}
              <div>
                <div className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id="documents"
                    checked={selections.documents.parent}
                    onCheckedChange={(checked) =>
                      handleParentChange('documents', checked)
                    }
                  />
                  <Label htmlFor="documents" className="font-medium">
                    <FileText className="mr-1 inline h-4 w-4" />
                    Documents
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reports"
                      checked={selections.documents.children.reports}
                      onCheckedChange={(checked) =>
                        handleChildChange('documents', 'reports', !!checked)
                      }
                    />
                    <Label htmlFor="reports" className="text-sm">
                      Reports (15 files)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="presentations"
                      checked={selections.documents.children.presentations}
                      onCheckedChange={(checked) =>
                        handleChildChange(
                          'documents',
                          'presentations',
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor="presentations" className="text-sm">
                      Presentations (8 files)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spreadsheets"
                      checked={selections.documents.children.spreadsheets}
                      onCheckedChange={(checked) =>
                        handleChildChange(
                          'documents',
                          'spreadsheets',
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor="spreadsheets" className="text-sm">
                      Spreadsheets (12 files)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div>
                <div className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id="media"
                    checked={selections.media.parent}
                    onCheckedChange={(checked) =>
                      handleParentChange('media', checked)
                    }
                  />
                  <Label htmlFor="media" className="font-medium">
                    <Image className="mr-1 inline h-4 w-4" />
                    Media
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="images"
                      checked={selections.media.children.images}
                      onCheckedChange={(checked) =>
                        handleChildChange('media', 'images', !!checked)
                      }
                    />
                    <Label htmlFor="images" className="text-sm">
                      Images (245 files)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="videos"
                      checked={selections.media.children.videos}
                      onCheckedChange={(checked) =>
                        handleChildChange('media', 'videos', !!checked)
                      }
                    />
                    <Label htmlFor="videos" className="text-sm">
                      Videos (23 files)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="audio"
                      checked={selections.media.children.audio}
                      onCheckedChange={(checked) =>
                        handleChildChange('media', 'audio', !!checked)
                      }
                    />
                    <Label htmlFor="audio" className="text-sm">
                      Audio (67 files)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <div className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id="settings"
                    checked={selections.settings.parent}
                    onCheckedChange={(checked) =>
                      handleParentChange('settings', checked)
                    }
                  />
                  <Label htmlFor="settings" className="font-medium">
                    <Settings className="mr-1 inline h-4 w-4" />
                    Settings
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preferences"
                      checked={selections.settings.children.preferences}
                      onCheckedChange={(checked) =>
                        handleChildChange('settings', 'preferences', !!checked)
                      }
                    />
                    <Label htmlFor="preferences" className="text-sm">
                      Preferences
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security"
                      checked={selections.settings.children.security}
                      onCheckedChange={(checked) =>
                        handleChildChange('settings', 'security', !!checked)
                      }
                    />
                    <Label htmlFor="security" className="text-sm">
                      Security
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifications"
                      checked={selections.settings.children.notifications}
                      onCheckedChange={(checked) =>
                        handleChildChange(
                          'settings',
                          'notifications',
                          !!checked,
                        )
                      }
                    />
                    <Label htmlFor="notifications" className="text-sm">
                      Notifications
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Feature Toggle List',
    description:
      'Feature flags and settings with descriptions and visual indicators',
    component: () => {
      const [features, setFeatures] = useState({
        darkMode: true,
        notifications: false,
        autoSave: true,
        collaboration: false,
        analytics: true,
        betaFeatures: false,
        offlineMode: true,
        advancedSearch: false,
      });

      const handleFeatureToggle = (feature: keyof typeof features) => {
        setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
      };

      const featureList = [
        {
          key: 'darkMode' as keyof typeof features,
          name: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: Eye,
          category: 'Appearance',
        },
        {
          key: 'notifications' as keyof typeof features,
          name: 'Push Notifications',
          description: 'Receive real-time notifications',
          icon: Bell,
          category: 'Notifications',
        },
        {
          key: 'autoSave' as keyof typeof features,
          name: 'Auto Save',
          description: 'Automatically save your work',
          icon: Zap,
          category: 'Productivity',
        },
        {
          key: 'collaboration' as keyof typeof features,
          name: 'Real-time Collaboration',
          description: 'Work together with team members',
          icon: Users,
          category: 'Collaboration',
          beta: true,
        },
        {
          key: 'analytics' as keyof typeof features,
          name: 'Usage Analytics',
          description: 'Help improve the product',
          icon: Globe,
          category: 'Data',
        },
        {
          key: 'betaFeatures' as keyof typeof features,
          name: 'Beta Features',
          description: 'Access experimental features',
          icon: Star,
          category: 'Advanced',
          beta: true,
        },
        {
          key: 'offlineMode' as keyof typeof features,
          name: 'Offline Mode',
          description: 'Work without internet connection',
          icon: Shield,
          category: 'Sync',
        },
        {
          key: 'advancedSearch' as keyof typeof features,
          name: 'Advanced Search',
          description: 'Enhanced search capabilities',
          icon: Settings,
          category: 'Search',
          beta: true,
        },
      ];

      const enabledCount = Object.values(features).filter(Boolean).length;

      return (
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Feature Settings</CardTitle>
            <CardDescription>
              Customize your experience with these feature toggles
              <Badge variant="outline" className="ml-2">
                {enabledCount}/{Object.keys(features).length} enabled
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureList.map((feature) => {
              const IconComponent = feature.icon;
              const isEnabled = features[feature.key];

              return (
                <div
                  key={feature.key}
                  className="flex items-start space-x-3 rounded-md border p-3"
                >
                  <Checkbox
                    id={feature.key}
                    checked={isEnabled}
                    onCheckedChange={() => handleFeatureToggle(feature.key)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <IconComponent className="text-muted-foreground h-4 w-4" />
                      <Label
                        htmlFor={feature.key}
                        className="cursor-pointer font-medium"
                      >
                        {feature.name}
                      </Label>
                      {feature.beta && (
                        <Badge variant="secondary" className="text-xs">
                          Beta
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {feature.category}
                      </Badge>
                      {isEnabled && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-xs text-green-700"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Size Variations',
    description: 'Different checkbox sizes for various use cases and contexts',
    component: () => {
      const [sizes, setSizes] = useState({
        small: false,
        default: true,
        large: false,
      });

      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Checkbox Sizes</CardTitle>
            <CardDescription>
              Different sizes for different contexts and visual hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="small"
                  checked={sizes.small}
                  onCheckedChange={(checked) =>
                    setSizes((prev) => ({ ...prev, small: !!checked }))
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor="small" className="text-sm">
                  Small checkbox (12px) - Used in compact lists and tables
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="default"
                  checked={sizes.default}
                  onCheckedChange={(checked) =>
                    setSizes((prev) => ({ ...prev, default: !!checked }))
                  }
                />
                <Label htmlFor="default">
                  Default checkbox (16px) - Standard size for most forms
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="large"
                  checked={sizes.large}
                  onCheckedChange={(checked) =>
                    setSizes((prev) => ({ ...prev, large: !!checked }))
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="large" className="text-base">
                  Large checkbox (20px) - For touch interfaces and accessibility
                </Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Usage Guidelines:</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-current" />
                  Small: Dense data tables, list items with many options
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-current" />
                  Default: Forms, settings pages, general UI interactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-current" />
                  Large: Touch interfaces, accessibility requirements,
                  prominently featured options
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
];

const apiReference = {
  title: 'Checkbox API Reference',
  description: 'Complete API documentation for the Checkbox component.',
  props: [
    {
      name: 'checked',
      type: 'boolean | "indeterminate"',
      default: 'false',
      description: 'The controlled checked state of the checkbox.',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      default: 'false',
      description: 'The initial checked state when uncontrolled.',
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean | "indeterminate") => void',
      description: 'Event handler called when the checked state changes.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'When true, prevents the user from interacting with the checkbox.',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description:
        'When true, indicates that the user must check the checkbox before submitting.',
    },
    {
      name: 'name',
      type: 'string',
      description: 'The name of the checkbox submitted with form data.',
    },
    {
      name: 'value',
      type: 'string',
      default: '"on"',
      description: 'The value given as data when submitted with a name.',
    },
    {
      name: 'id',
      type: 'string',
      description: 'The id attribute of the checkbox element.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the checkbox.',
    },
    {
      name: '...props',
      type: 'React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>',
      description:
        'All props from Radix UI Checkbox.Root component including form, data attributes, etc.',
    },
  ],
  examples: [
    {
      title: 'Basic Usage',
      code: `import { Checkbox } from '@portal/ui/checkbox';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">
    Accept terms and conditions
  </label>
</div>`,
    },
    {
      title: 'Controlled Checkbox',
      code: `const [checked, setChecked] = useState(false);

<Checkbox
  id="newsletter"
  checked={checked}
  onCheckedChange={setChecked}
/>`,
    },
    {
      title: 'Indeterminate State',
      code: `const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>`,
    },
    {
      title: 'With Label Component',
      code: `import { Label } from '@portal/ui/label';

<div className="items-top flex space-x-2">
  <Checkbox id="terms1" />
  <div className="grid gap-1.5 leading-none">
    <Label
      htmlFor="terms1"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      Accept terms and conditions
    </Label>
    <p className="text-xs text-muted-foreground">
      You agree to our Terms of Service and Privacy Policy.
    </p>
  </div>
</div>`,
    },
  ],
};

const usageGuidelines = {
  title: 'Checkbox Usage Guidelines',
  description:
    'Best practices for implementing checkboxes that provide excellent user experience.',
  guidelines: [
    {
      title: 'When to Use Checkboxes',
      items: [
        'Allowing users to select multiple options from a list',
        'Single binary choice that can be toggled on or off',
        'Terms and conditions acceptance in forms',
        'Feature toggles and preference settings',
        'Bulk selection in lists and data tables (with parent-child relationships)',
      ],
    },
    {
      title: 'Checkbox vs. Other Controls',
      items: [
        'Use checkboxes for multiple selections, radio buttons for single selection',
        'Use switches for immediate state changes, checkboxes for form submissions',
        'Prefer checkboxes over dropdowns when options are few and visible space allows',
        'Use checkboxes with labels, not as standalone interactive elements',
        'Consider toggle switches for settings that take effect immediately',
      ],
    },
    {
      title: 'Labeling and Content',
      items: [
        'Always provide clear, concise labels for checkboxes',
        'Use positive language (what will happen when checked)',
        'Place labels to the right of checkboxes for better readability',
        'Make labels clickable by associating them with checkbox IDs',
        'Provide additional context or help text when needed',
      ],
    },
    {
      title: 'Visual Design',
      items: [
        'Use consistent checkbox sizes throughout your interface',
        'Ensure sufficient color contrast for accessibility (4.5:1 minimum)',
        'Provide clear visual feedback for hover, focus, and disabled states',
        'Use indeterminate state for parent checkboxes when children are partially selected',
        'Maintain adequate spacing between checkboxes and labels',
      ],
    },
    {
      title: 'Accessibility',
      items: [
        'Checkboxes automatically include proper ARIA attributes',
        'Use fieldset and legend for groups of related checkboxes',
        'Ensure keyboard navigation works (Space to toggle, Tab to navigate)',
        'Provide sufficient touch targets for mobile interfaces (44px minimum)',
        'Announce state changes clearly to screen readers',
      ],
    },
    {
      title: 'Form Integration',
      items: [
        'Always validate required checkboxes before form submission',
        'Provide clear error messaging for failed validation',
        'Maintain checkbox state during form submission errors',
        'Use proper name attributes for server-side form handling',
        'Group related checkboxes logically with visual separators',
      ],
    },
  ],
};

export default function CheckboxStory() {
  const [controls, setControls] = useState({
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    size: 'default' as 'sm' | 'default' | 'lg',
    className: '',
  });

  const generateCode = () => {
    const checkedValue = controls.indeterminate
      ? '"indeterminate"'
      : controls.checked.toString();
    const sizeClass =
      controls.size !== 'default' ? sizeClasses[controls.size] : '';

    const className = [sizeClass, controls.className].filter(Boolean).join(' ');

    const propsString = generatePropsString(
      {
        id: 'checkbox',
        checked: controls.indeterminate
          ? '"indeterminate"'
          : controls.checked
            ? 'true'
            : 'false',
        onCheckedChange: 'setChecked',
        disabled: controls.disabled ? true : undefined,
        required: controls.required ? true : undefined,
        className: className || undefined,
      },
      {
        checked: 'false',
        disabled: false,
        required: false,
      },
    );

    const importStatement = generateImportStatement(
      ['Checkbox'],
      '@portal/ui/checkbox',
    );
    const labelImport = generateImportStatement(['Label'], '@portal/ui/label');
    const stateImport = 'const [checked, setChecked] = useState(false);';

    const checkboxComponent = `<div className="flex items-center space-x-2">
  <Checkbox${propsString} />
  <Label htmlFor="checkbox">
    Accept terms and conditions
  </Label>
</div>`;

    return `${importStatement}\n${labelImport}\n\n${stateImport}\n\n${checkboxComponent}`;
  };

  const controlsContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="checked">Checked</Label>
        <Switch
          id="checked"
          checked={controls.checked}
          onCheckedChange={(checked) =>
            setControls((prev) => ({ ...prev, checked, indeterminate: false }))
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="indeterminate">Indeterminate</Label>
        <Switch
          id="indeterminate"
          checked={controls.indeterminate}
          onCheckedChange={(indeterminate) =>
            setControls((prev) => ({ ...prev, indeterminate, checked: false }))
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disabled">Disabled</Label>
        <Switch
          id="disabled"
          checked={controls.disabled}
          onCheckedChange={(disabled) =>
            setControls((prev) => ({ ...prev, disabled }))
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required">Required</Label>
        <Switch
          id="required"
          checked={controls.required}
          onCheckedChange={(required) =>
            setControls((prev) => ({ ...prev, required }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Size</Label>
        <Select
          value={controls.size}
          onValueChange={(value: 'sm' | 'default' | 'lg') =>
            setControls((prev) => ({ ...prev, size: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="demo-checkbox"
          checked={controls.indeterminate ? 'indeterminate' : controls.checked}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') {
              setControls((prev) => ({
                ...prev,
                indeterminate: true,
                checked: false,
              }));
            } else {
              setControls((prev) => ({
                ...prev,
                checked: !!checked,
                indeterminate: false,
              }));
            }
          }}
          disabled={controls.disabled}
          required={controls.required}
          className={`${sizeClasses[controls.size]} ${controls.className}`}
        />
        <Label
          htmlFor="demo-checkbox"
          className={controls.disabled ? 'opacity-50' : ''}
        >
          Accept terms and conditions{' '}
          {controls.required && <span className="text-red-500">*</span>}
        </Label>
      </div>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Checkbox"
      previewDescription="Toggle between different checkbox states"
      controlsTitle="Checkbox Configuration"
      controlsDescription="Customize checkbox appearance and behavior"
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
