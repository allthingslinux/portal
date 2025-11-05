'use client';

import { useState } from 'react';

import { BarChart3, FileText, Home, Settings, Users } from 'lucide-react';

import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '@portal/ui/bordered-navigation-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import { Switch } from '@portal/ui/switch';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface BorderedNavigationMenuControls {
  showIcons: boolean;
}

export function BorderedNavigationMenuStory() {
  const { controls, updateControl } =
    useStoryControls<BorderedNavigationMenuControls>({
      showIcons: true,
    });

  const [activeTab, setActiveTab] = useState('#dashboard');

  const generateCode = () => {
    return `import { BorderedNavigationMenu, BorderedNavigationMenuItem } from '@portal/ui/bordered-navigation-menu';
import { usePathname } from 'next/navigation';

const pathname = usePathname();

<BorderedNavigationMenu>
  <BorderedNavigationMenuItem
    path="#dashboard"
    label="Dashboard"
    active={pathname === '#dashboard'}
  />
  <BorderedNavigationMenuItem
    path="#users"
    label="Users"
    active={pathname === '#users'}
  />
  <BorderedNavigationMenuItem
    path="#settings"
    label="Settings"
    active={pathname === '#settings'}
  />
</BorderedNavigationMenu>`;
  };

  const navigationItems = [
    {
      path: '#dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      path: '#users',
      label: 'Users',
      icon: Users,
    },
    {
      path: '#analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      path: '#reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      path: '#settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const renderPreview = () => (
    <div className="w-full">
      <BorderedNavigationMenu>
        {navigationItems.map((item) => (
          <BorderedNavigationMenuItem
            key={item.path}
            path={item.path}
            label={
              controls.showIcons ? (
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              ) : (
                item.label
              )
            }
            active={activeTab === item.path}
          />
        ))}
      </BorderedNavigationMenu>

      <div className="bg-muted/20 mt-8 rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Simulated Navigation</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Click tabs above to see active state changes:
        </p>
        <div className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`rounded px-3 py-1 text-sm ${
                activeTab === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showIcons">Show Icons</Label>
        <Switch
          id="showIcons"
          checked={controls.showIcons}
          onCheckedChange={(checked) => updateControl('showIcons', checked)}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Navigation</CardTitle>
          <CardDescription>Simple text-only navigation menu</CardDescription>
        </CardHeader>
        <CardContent>
          <BorderedNavigationMenu>
            <BorderedNavigationMenuItem
              path="/home"
              label="Home"
              active={true}
            />
            <BorderedNavigationMenuItem
              path="/about"
              label="About"
              active={false}
            />
            <BorderedNavigationMenuItem
              path="/contact"
              label="Contact"
              active={false}
            />
          </BorderedNavigationMenu>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation with Icons</CardTitle>
          <CardDescription>
            Navigation menu items with icons and labels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BorderedNavigationMenu>
            <BorderedNavigationMenuItem
              path="/overview"
              label={
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              }
              active={false}
            />
            <BorderedNavigationMenuItem
              path="/team"
              label={
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </div>
              }
              active={true}
            />
            <BorderedNavigationMenuItem
              path="/config"
              label={
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Config</span>
                </div>
              }
              active={false}
            />
          </BorderedNavigationMenu>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsive Navigation</CardTitle>
          <CardDescription>
            How navigation adapts to different screen sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Desktop View</h4>
              <BorderedNavigationMenu>
                <BorderedNavigationMenuItem
                  path="/dashboard"
                  label="Dashboard"
                  active={true}
                />
                <BorderedNavigationMenuItem
                  path="/projects"
                  label="Projects"
                  active={false}
                />
                <BorderedNavigationMenuItem
                  path="/team"
                  label="Team Members"
                  active={false}
                />
                <BorderedNavigationMenuItem
                  path="/settings"
                  label="Settings"
                  active={false}
                />
                <BorderedNavigationMenuItem
                  path="/settings"
                  label="Account Settings"
                  active={false}
                />
              </BorderedNavigationMenu>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">
                Mobile View (Simulated)
              </h4>
              <div className="bg-muted/20 rounded-lg border p-2">
                <p className="text-muted-foreground text-xs">
                  On smaller screens, only active and adjacent items are
                  typically shown, with overflow handled by the navigation
                  system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>BorderedNavigationMenu Components</CardTitle>
        <CardDescription>
          Complete API reference for BorderedNavigationMenu components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">
              BorderedNavigationMenu
            </h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Container component for navigation menu items with bordered active
              state.
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
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">
                      BorderedNavigationMenuItem components
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">
              BorderedNavigationMenuItem
            </h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Individual navigation menu item with automatic active state
              detection.
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
                    <td className="p-3 font-mono text-sm">path</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Navigation path/route</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">label</td>
                    <td className="p-3 font-mono text-sm">
                      ReactNode | string
                    </td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Display label or component</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">active</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">auto-detected</td>
                    <td className="p-3">Override active state</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">end</td>
                    <td className="p-3 font-mono text-sm">
                      boolean | function
                    </td>
                    <td className="p-3 font-mono text-sm">false</td>
                    <td className="p-3">Exact path matching</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">buttonClassName</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">CSS classes for button element</td>
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
          <CardTitle>When to Use BorderedNavigationMenu</CardTitle>
          <CardDescription>
            Best practices for bordered navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use BorderedNavigationMenu For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Primary navigation within sections</li>
              <li>• Tab-style navigation for related content</li>
              <li>• Dashboard and admin panel navigation</li>
              <li>• Settings and configuration sections</li>
              <li>• Multi-step form navigation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Use Other Patterns For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Site-wide main navigation (use header navigation)</li>
              <li>• Deep hierarchical navigation (use sidebar)</li>
              <li>• Single-action buttons (use regular buttons)</li>
              <li>• Pagination (use pagination component)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Guidelines</CardTitle>
          <CardDescription>
            Creating effective navigation experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Active State Indication</h4>
            <p className="text-muted-foreground text-sm">
              The bordered bottom line clearly indicates the current active
              section. Use consistent active state styling across your
              application.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Label Clarity</h4>
            <p className="text-muted-foreground text-sm">
              Use clear, concise labels that accurately describe the
              destination. Consider adding icons for better visual recognition.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Responsive Behavior</h4>
            <p className="text-muted-foreground text-sm">
              On smaller screens, non-active items may be hidden to save space.
              Plan your navigation hierarchy accordingly.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
          <CardDescription>Built-in accessibility support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyboard Navigation</h4>
            <p className="text-muted-foreground text-sm">
              Full keyboard support with Tab navigation and Enter/Space
              activation.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Screen Reader Support</h4>
            <p className="text-muted-foreground text-sm">
              Proper ARIA attributes and semantic HTML for assistive
              technologies.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Focus Management</h4>
            <p className="text-muted-foreground text-sm">
              Clear focus indicators and proper focus management during
              navigation.
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
