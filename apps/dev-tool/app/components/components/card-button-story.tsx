'use client';

import { useState } from 'react';

import {
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  CardButton,
  CardButtonContent,
  CardButtonFooter,
  CardButtonHeader,
  CardButtonTitle,
} from '@portal/ui/card-button';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { toast } from '@portal/ui/sonner';
import { Switch } from '@portal/ui/switch';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface CardButtonControls {
  showArrow: boolean;
  showFooter: boolean;
  showBadge: boolean;
  clickable: boolean;
}

export function CardButtonStory() {
  const { controls, updateControl } = useStoryControls<CardButtonControls>({
    showArrow: true,
    showFooter: false,
    showBadge: false,
    clickable: true,
  });

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        onClick: controls.clickable ? '() => handleClick()' : undefined,
      },
      {
        onClick: undefined,
      },
    );

    return `<CardButton${propsString}>
  <CardButtonHeader displayArrow={${controls.showArrow}}>
    <CardButtonTitle>
      Card Title
    </CardButtonTitle>
  </CardButtonHeader>
  
  <CardButtonContent>
    <p className="text-sm text-muted-foreground">
      Card content goes here...
    </p>
  </CardButtonContent>
  
  ${
    controls.showFooter
      ? `<CardButtonFooter>
    <Badge variant="secondary">Footer</Badge>
  </CardButtonFooter>`
      : ''
  }
</CardButton>`;
  };

  const handleCardClick = (cardName: string) => {
    if (controls.clickable) {
      setSelectedCard(cardName);
      toast.success(`Clicked ${cardName}`);
      setTimeout(() => setSelectedCard(null), 1000);
    }
  };

  const renderPreview = () => (
    <div className="w-full max-w-sm">
      <CardButton
        onClick={
          controls.clickable ? () => handleCardClick('Preview Card') : undefined
        }
        className={selectedCard === 'Preview Card' ? 'ring-primary ring-2' : ''}
      >
        <CardButtonHeader displayArrow={controls.showArrow}>
          <div className="flex items-center space-x-2">
            <Settings className="text-primary h-5 w-5" />
            <CardButtonTitle>Settings</CardButtonTitle>
            {controls.showBadge && <Badge variant="secondary">New</Badge>}
          </div>
        </CardButtonHeader>

        <CardButtonContent>
          <p className="text-muted-foreground text-sm">
            Configure your application settings and preferences.
          </p>
        </CardButtonContent>

        {controls.showFooter && (
          <CardButtonFooter>
            <Badge variant="outline">Configuration</Badge>
          </CardButtonFooter>
        )}
      </CardButton>
    </div>
  );

  const renderControls = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="clickable">Clickable</Label>
        <Switch
          id="clickable"
          checked={controls.clickable}
          onCheckedChange={(checked) => updateControl('clickable', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showArrow">Show Arrow</Label>
        <Switch
          id="showArrow"
          checked={controls.showArrow}
          onCheckedChange={(checked) => updateControl('showArrow', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showBadge">Show Badge</Label>
        <Switch
          id="showBadge"
          checked={controls.showBadge}
          onCheckedChange={(checked) => updateControl('showBadge', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showFooter">Show Footer</Label>
        <Switch
          id="showFooter"
          checked={controls.showFooter}
          onCheckedChange={(checked) => updateControl('showFooter', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Cards</CardTitle>
          <CardDescription>
            Different card button configurations for feature selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CardButton
              onClick={() => handleCardClick('Users')}
              className={selectedCard === 'Users' ? 'ring-primary ring-2' : ''}
            >
              <CardButtonHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <CardButtonTitle>User Management</CardButtonTitle>
                </div>
              </CardButtonHeader>
              <CardButtonContent>
                <p className="text-muted-foreground text-sm">
                  Manage users, roles, and permissions across your application.
                </p>
              </CardButtonContent>
            </CardButton>

            <CardButton
              onClick={() => handleCardClick('Billing')}
              className={
                selectedCard === 'Billing' ? 'ring-primary ring-2' : ''
              }
            >
              <CardButtonHeader>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <CardButtonTitle>Billing</CardButtonTitle>
                </div>
              </CardButtonHeader>
              <CardButtonContent>
                <p className="text-muted-foreground text-sm">
                  Configure account settings and preferences.
                </p>
              </CardButtonContent>
            </CardButton>

            <CardButton
              onClick={() => handleCardClick('Security')}
              className={
                selectedCard === 'Security' ? 'ring-primary ring-2' : ''
              }
            >
              <CardButtonHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <CardButtonTitle>Security</CardButtonTitle>
                  <Badge variant="destructive" className="text-xs">
                    Important
                  </Badge>
                </div>
              </CardButtonHeader>
              <CardButtonContent>
                <p className="text-muted-foreground text-sm">
                  Set up two-factor authentication and security policies.
                </p>
              </CardButtonContent>
            </CardButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cards with Footers</CardTitle>
          <CardDescription>
            Card buttons with footer content and status indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <CardButton
              onClick={() => handleCardClick('Reports')}
              className={
                selectedCard === 'Reports' ? 'ring-primary ring-2' : ''
              }
            >
              <CardButtonHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <CardButtonTitle>Reports</CardButtonTitle>
                </div>
              </CardButtonHeader>
              <CardButtonContent>
                <p className="text-muted-foreground text-sm">
                  Generate and view detailed analytics reports.
                </p>
              </CardButtonContent>
              <CardButtonFooter>
                <Badge variant="default">Available</Badge>
              </CardButtonFooter>
            </CardButton>

            <CardButton
              onClick={() => handleCardClick('Calendar')}
              className={
                selectedCard === 'Calendar' ? 'ring-primary ring-2' : ''
              }
            >
              <CardButtonHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <CardButtonTitle>Calendar</CardButtonTitle>
                </div>
              </CardButtonHeader>
              <CardButtonContent>
                <p className="text-muted-foreground text-sm">
                  Schedule meetings and manage appointments.
                </p>
              </CardButtonContent>
              <CardButtonFooter>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardButtonFooter>
            </CardButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>CardButton Components</CardTitle>
        <CardDescription>
          Complete API reference for CardButton component family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">CardButton</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              The main card button container component.
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
                    <td className="p-3 font-mono text-sm">asChild</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Render as child element</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">onClick</td>
                    <td className="p-3 font-mono text-sm">function</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Click handler function</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 text-lg font-semibold">CardButtonHeader</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Header section with optional arrow indicator.
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
                    <td className="p-3 font-mono text-sm">displayArrow</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">true</td>
                    <td className="p-3">Show chevron right arrow</td>
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
          <CardTitle>When to Use CardButton</CardTitle>
          <CardDescription>Best practices for card buttons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use CardButton For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Feature selection and configuration options</li>
              <li>• Dashboard navigation cards</li>
              <li>• Settings and preference categories</li>
              <li>• Action cards with rich content</li>
              <li>• Onboarding step selection</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Use Regular Buttons For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Simple actions without additional context</li>
              <li>• Form submissions</li>
              <li>• Primary/secondary actions in dialogs</li>
              <li>• Toolbar actions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Guidelines</CardTitle>
          <CardDescription>
            Creating effective card button layouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Visual Hierarchy</h4>
            <p className="text-muted-foreground text-sm">
              Use icons, colors, and typography to create clear visual
              distinction.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Content Structure</h4>
            <p className="text-muted-foreground text-sm">
              Keep titles concise, provide meaningful descriptions, use footers
              for status.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Interactive States</h4>
            <p className="text-muted-foreground text-sm">
              Provide clear hover, active, and selected state feedback.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout Patterns</CardTitle>
          <CardDescription>Common CardButton arrangements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Grid Layout</h4>
            <p className="text-muted-foreground text-sm">
              Use CSS Grid for equal-height cards in responsive layouts.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Vertical Stack</h4>
            <p className="text-muted-foreground text-sm">
              Stack cards vertically for settings pages or step-by-step flows.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Mixed Sizes</h4>
            <p className="text-muted-foreground text-sm">
              Vary card sizes based on content importance and hierarchy.
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
