'use client';

import { useState } from 'react';

import {
  BarChart3,
  Bell,
  Calendar,
  Code2,
  CreditCard,
  FileText,
  Globe,
  Mail,
  Settings,
  Shield,
  User,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';
import { Textarea } from '@portal/ui/textarea';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface TabsControlsProps {
  defaultValue: string;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'default' | 'lg';
  fullWidth: boolean;
  className: string;
  onDefaultValueChange: (value: string) => void;
  onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
  onVariantChange: (variant: 'default' | 'pills' | 'underline') => void;
  onSizeChange: (size: 'sm' | 'default' | 'lg') => void;
  onFullWidthChange: (fullWidth: boolean) => void;
  onClassNameChange: (className: string) => void;
}

const variantClasses = {
  default: '',
  pills:
    '[&>div]:bg-background [&>div]:border [&>div]:rounded-lg [&>div]:p-1 [&_button]:rounded-md [&_button[data-state=active]]:bg-primary [&_button[data-state=active]]:text-primary-foreground',
  underline:
    '[&>div]:bg-transparent [&>div]:border-b [&>div]:rounded-none [&_button]:rounded-none [&_button]:border-b-2 [&_button]:border-transparent [&_button[data-state=active]]:border-primary [&_button[data-state=active]]:bg-transparent',
};

const sizeClasses = {
  sm: '[&_button]:h-8 [&_button]:px-2 [&_button]:text-sm',
  default: '[&_button]:h-10 [&_button]:px-3',
  lg: '[&_button]:h-12 [&_button]:px-4 [&_button]:text-lg',
};

function TabsPlayground({
  defaultValue,
  orientation,
  variant,
  size,
  fullWidth,
  className,
}: TabsControlsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      orientation={orientation}
      className={`${orientation === 'vertical' ? 'flex gap-4' : ''} ${className}`}
    >
      <TabsList
        className={` ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth && orientation === 'horizontal' ? 'w-full' : ''} ${orientation === 'vertical' ? 'h-fit flex-col' : ''} `}
      >
        <TabsTrigger value="overview" className={fullWidth ? 'flex-1' : ''}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="settings" className={fullWidth ? 'flex-1' : ''}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <div className={orientation === 'vertical' ? 'flex-1' : 'mt-4'}>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dashboard Overview
              </CardTitle>
              <CardDescription>
                Get insights into your application performance and usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">12,345</p>
                  <Badge variant="secondary">+12% from last month</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <Badge variant="secondary">+5% from last week</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>
                Configure your application preferences and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="My Application" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications about important events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </div>
    </Tabs>
  );
}

const examples = [
  {
    title: 'Profile Settings',
    description: 'User profile management with multiple settings sections',
    component: () => {
      return (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>

                <Button>Save Profile</Button>
              </TabsContent>

              <TabsContent value="security" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-muted-foreground text-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>

                <Button>Update Security</Button>
              </TabsContent>

              <TabsContent value="notifications" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-muted-foreground text-sm">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-muted-foreground text-sm">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-muted-foreground text-sm">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button>Save Preferences</Button>
              </TabsContent>

              <TabsContent value="preferences" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" defaultValue="English" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="UTC-5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-muted-foreground text-sm">
                        Use dark theme across the application
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button>Save Preferences</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Project Documentation',
    description: 'Vertical tabs for navigation with different content sections',
    component: () => {
      return (
        <div className="w-full max-w-4xl">
          <Tabs
            defaultValue="readme"
            orientation="vertical"
            className="flex gap-6"
          >
            <TabsList className="h-fit w-48 flex-col">
              <TabsTrigger value="readme" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                README
              </TabsTrigger>
              <TabsTrigger value="api" className="w-full justify-start">
                <Code2 className="mr-2 h-4 w-4" />
                API Docs
              </TabsTrigger>
              <TabsTrigger value="examples" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Examples
              </TabsTrigger>
              <TabsTrigger value="changelog" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Changelog
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="readme">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project README
                    </CardTitle>
                    <CardDescription>
                      Get started with this project in minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Installation</h3>
                      <code className="bg-muted block rounded-md p-3 text-sm">
                        npm install my-awesome-package
                      </code>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Quick Start</h3>
                      <p className="text-muted-foreground">
                        Import the package and start building amazing things
                        with just a few lines of code.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5" />
                      API Reference
                    </CardTitle>
                    <CardDescription>
                      Complete API documentation and method references
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Methods</h3>
                      <div className="space-y-2">
                        <div className="rounded-md border p-3">
                          <code className="font-mono">getData()</code>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Fetches data from the API endpoint
                          </p>
                        </div>
                        <div className="rounded-md border p-3">
                          <code className="font-mono">updateData(data)</code>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Updates existing data with new values
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Code Examples
                    </CardTitle>
                    <CardDescription>
                      Real-world examples and use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Basic Usage</h3>
                      <code className="bg-muted block rounded-md p-3 text-sm">
                        {`import { MyComponent } from 'my-package';

function App() {
  return <MyComponent data="example" />;
}`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="changelog">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Changelog
                    </CardTitle>
                    <CardDescription>
                      Recent updates and version history
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="border-l-2 border-green-500 pl-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">v2.1.0</Badge>
                          <span className="text-muted-foreground text-sm">
                            2024-01-15
                          </span>
                        </div>
                        <p className="mt-1 text-sm">
                          Added new data visualization components
                        </p>
                      </div>

                      <div className="border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">v2.0.0</Badge>
                          <span className="text-muted-foreground text-sm">
                            2024-01-01
                          </span>
                        </div>
                        <p className="mt-1 text-sm">
                          Major version with breaking changes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      );
    },
  },
  {
    title: 'Content Management',
    description: 'Pills variant tabs for content creation and management',
    component: () => {
      const [activeTab, setActiveTab] = useState('write');

      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Content Editor</CardTitle>
            <CardDescription>
              Create and manage your content with our powerful editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-background rounded-lg border p-1">
                <TabsTrigger value="write" className="rounded-md">
                  <FileText className="mr-2 h-4 w-4" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-md">
                  <Globe className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-md">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="publish" className="rounded-md">
                  <Mail className="mr-2 h-4 w-4" />
                  Publish
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input id="title" placeholder="Enter your article title..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Start writing your article..."
                    rows={10}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setActiveTab('preview')}>
                    Preview Article
                  </Button>
                  <Button variant="outline">Save Draft</Button>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4 space-y-4">
                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-2xl font-bold">Article Preview</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">
                      Your article content will appear here as it will be
                      displayed to readers. This preview shows you exactly how
                      your formatting and styling will look.
                    </p>
                    <p className="text-muted-foreground">
                      You can switch back to the Write tab to make changes, or
                      proceed to Settings to configure publication options.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveTab('write')}
                    variant="outline"
                  >
                    Back to Editor
                  </Button>
                  <Button onClick={() => setActiveTab('publish')}>
                    Ready to Publish
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="Technology, Business, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="Separate tags with commas" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Comments</Label>
                      <p className="text-muted-foreground text-sm">
                        Let readers comment on this article
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured Article</Label>
                      <p className="text-muted-foreground text-sm">
                        Show this article prominently on the homepage
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button>Save Settings</Button>
              </TabsContent>

              <TabsContent value="publish" className="mt-4 space-y-4">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    Ready to Publish
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Review your article details before publishing. Once
                    published, your article will be visible to all readers.
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Word Count:</span>
                      <span>245 words</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Estimated Read Time:
                      </span>
                      <span>1 minute</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Publish Now</Button>
                  <Button variant="outline">Schedule</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Dashboard Analytics',
    description: 'Underline variant tabs for data visualization sections',
    component: () => {
      return (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Track your application's performance and user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
                >
                  <User className="mr-2 h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger
                  value="revenue"
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Revenue
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold">$45,231</p>
                        <Badge variant="secondary" className="text-xs">
                          +20.1% from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold">2,350</p>
                        <Badge variant="secondary" className="text-xs">
                          +10.5% from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          New Signups
                        </p>
                        <p className="text-2xl font-bold">573</p>
                        <Badge variant="secondary" className="text-xs">
                          +15.3% from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          Conversion Rate
                        </p>
                        <p className="text-2xl font-bold">12.5%</p>
                        <Badge variant="secondary" className="text-xs">
                          +2.4% from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground flex h-64 items-center justify-center">
                      Chart visualization would go here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground flex h-48 items-center justify-center">
                        User growth chart
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        User Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground flex h-48 items-center justify-center">
                        Demographics breakdown
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground flex h-64 items-center justify-center">
                      Revenue charts and analysis
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Report</CardTitle>
                      <CardDescription>
                        January 2024 Performance Summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button>Download PDF</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Reports</CardTitle>
                      <CardDescription>
                        Generate custom reports for specific metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button>Create Report</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    },
  },
];

const apiReference = {
  title: 'Tabs API Reference',
  description: 'Complete API documentation for the Tabs component family.',
  props: [
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'The value of the tab that should be active when initially rendered.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'The controlled value of the tab to activate.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Event handler called when the value changes.',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      default: '"horizontal"',
      description: 'The orientation of the component.',
    },
    {
      name: 'dir',
      type: '"ltr" | "rtl"',
      description: 'The reading direction of tabs when applicable.',
    },
    {
      name: 'activationMode',
      type: '"automatic" | "manual"',
      default: '"automatic"',
      description: 'Whether a tab is activated automatically or manually.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes for the tabs container.',
    },
    {
      name: '...props',
      type: 'React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>',
      description:
        'All props from Radix UI Tabs.Root component including asChild, id, etc.',
    },
  ],
  examples: [
    {
      title: 'Basic Usage',
      code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab One</TabsTrigger>
    <TabsTrigger value="tab2">Tab Two</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for tab one</TabsContent>
  <TabsContent value="tab2">Content for tab two</TabsContent>
</Tabs>`,
    },
    {
      title: 'Controlled Tabs',
      code: `const [activeTab, setActiveTab] = useState('home');

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="home">Home</TabsTrigger>
    <TabsTrigger value="about">About</TabsTrigger>
  </TabsList>
  <TabsContent value="home">Home content</TabsContent>
  <TabsContent value="about">About content</TabsContent>
</Tabs>`,
    },
    {
      title: 'Vertical Orientation',
      code: `<Tabs defaultValue="profile" orientation="vertical" className="flex gap-4">
  <TabsList className="flex-col h-fit">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <div className="flex-1">
    <TabsContent value="profile">Profile content</TabsContent>
    <TabsContent value="settings">Settings content</TabsContent>
  </div>
</Tabs>`,
    },
    {
      title: 'Full Width Tabs',
      code: `<Tabs defaultValue="overview">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  {/* Tab content */}
</Tabs>`,
    },
  ],
};

const usageGuidelines = {
  title: 'Tabs Usage Guidelines',
  description:
    'Best practices for implementing tabs that provide excellent user experience.',
  guidelines: [
    {
      title: 'When to Use Tabs',
      items: [
        "Organizing related content that doesn't need to be viewed simultaneously",
        'Breaking down complex forms or settings into manageable sections',
        'Switching between different views of the same data (table vs. chart)',
        'Providing different content formats (edit vs. preview)',
        'Organizing dashboard sections or feature categories',
      ],
    },
    {
      title: 'Tab Organization',
      items: [
        'Order tabs logically: most important or frequently used first',
        'Keep tab labels short and descriptive (1-2 words when possible)',
        'Use consistent terminology and avoid jargon',
        'Limit the number of tabs (5-7 maximum for horizontal, more acceptable for vertical)',
        'Group related functionality within the same tab',
      ],
    },
    {
      title: 'Visual Design',
      items: [
        'Use icons with labels to improve recognition and scannability',
        'Maintain consistent styling across all tabs in an interface',
        'Ensure clear visual distinction between active and inactive states',
        'Consider the container size when choosing orientation',
        'Use appropriate spacing and padding for touch targets',
      ],
    },
    {
      title: 'Content Strategy',
      items: [
        "Make each tab's content independent and self-contained",
        'Provide clear headings and descriptions within tab content',
        'Consider loading states for tabs with dynamic content',
        'Maintain context when users switch between tabs',
        'Use consistent content structure across similar tabs',
      ],
    },
    {
      title: 'Accessibility',
      items: [
        'Tabs automatically include proper ARIA attributes and keyboard navigation',
        'Use arrow keys for tab navigation and Enter/Space to activate',
        'Provide meaningful labels that describe the content purpose',
        'Ensure sufficient color contrast for all tab states',
        'Consider users who rely on screen readers for content announcement',
      ],
    },
    {
      title: 'Responsive Considerations',
      items: [
        'Consider horizontal scrolling for many tabs on smaller screens',
        'Switch to vertical orientation on mobile when appropriate',
        'Ensure touch targets are large enough for mobile interaction',
        'Use full-width tabs on narrow screens to maximize usability',
        'Consider collapsing to an accordion pattern on very small screens',
      ],
    },
  ],
};

export default function TabsStory() {
  const [controls, setControls] = useState({
    defaultValue: 'overview',
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    variant: 'default' as 'default' | 'pills' | 'underline',
    size: 'default' as 'sm' | 'default' | 'lg',
    fullWidth: false,
    className: '',
  });

  const generateCode = () => {
    const tabsListClasses = [
      variantClasses[controls.variant],
      sizeClasses[controls.size],
      controls.fullWidth && controls.orientation === 'horizontal'
        ? 'w-full'
        : '',
      controls.orientation === 'vertical' ? 'flex-col h-fit' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const tabsClassName =
      controls.orientation === 'vertical' ? 'flex gap-4' : '';
    const contentClassName =
      controls.orientation === 'vertical' ? 'flex-1' : 'mt-4';
    const triggerClassName = controls.fullWidth ? 'flex-1' : '';

    const tabsPropsString = generatePropsString({
      defaultValue: controls.defaultValue,
      orientation:
        controls.orientation !== 'horizontal'
          ? controls.orientation
          : undefined,
      className:
        [tabsClassName, controls.className].filter(Boolean).join(' ') ||
        undefined,
    });

    const tabsListPropsString = generatePropsString({
      className: tabsListClasses || undefined,
    });

    const tabsTriggerPropsString = generatePropsString({
      className: triggerClassName || undefined,
    });

    const importStatement = generateImportStatement(
      ['Tabs', 'TabsContent', 'TabsList', 'TabsTrigger'],
      '@portal/ui/tabs',
    );

    const exampleCode = `<Tabs${tabsPropsString}>
  <TabsList${tabsListPropsString}>
    <TabsTrigger value="overview"${triggerClassName ? ` className="${triggerClassName}"` : ''}>
      Overview
    </TabsTrigger>
    <TabsTrigger value="settings"${triggerClassName ? ` className="${triggerClassName}"` : ''}>
      Settings
    </TabsTrigger>
  </TabsList>

  <div${contentClassName ? ` className="${contentClassName}"` : ''}>
    <TabsContent value="overview">
      Overview content goes here
    </TabsContent>
    <TabsContent value="settings">
      Settings content goes here
    </TabsContent>
  </div>
</Tabs>`;

    return `${importStatement}\n\n${exampleCode}`;
  };

  return (
    <ComponentStoryLayout
      preview={
        <TabsPlayground
          defaultValue={controls.defaultValue}
          orientation={controls.orientation}
          variant={controls.variant}
          size={controls.size}
          fullWidth={controls.fullWidth}
          className={controls.className}
          onDefaultValueChange={(value) =>
            setControls((prev) => ({ ...prev, defaultValue: value }))
          }
          onOrientationChange={(orientation) =>
            setControls((prev) => ({ ...prev, orientation }))
          }
          onVariantChange={(variant) =>
            setControls((prev) => ({ ...prev, variant }))
          }
          onSizeChange={(size) => setControls((prev) => ({ ...prev, size }))}
          onFullWidthChange={(fullWidth) =>
            setControls((prev) => ({ ...prev, fullWidth }))
          }
          onClassNameChange={(className) =>
            setControls((prev) => ({ ...prev, className }))
          }
        />
      }
      generatedCode={generateCode()}
      controls={
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Select
              value={controls.defaultValue}
              onValueChange={(value) =>
                setControls((prev) => ({ ...prev, defaultValue: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orientation">Orientation</Label>
            <Select
              value={controls.orientation}
              onValueChange={(value: 'horizontal' | 'vertical') =>
                setControls((prev) => ({ ...prev, orientation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Variant</Label>
            <Select
              value={controls.variant}
              onValueChange={(value: 'default' | 'pills' | 'underline') =>
                setControls((prev) => ({ ...prev, variant: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="pills">Pills</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="fullWidth">Full Width</Label>
            <Switch
              id="fullWidth"
              checked={controls.fullWidth}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, fullWidth: checked }))
              }
            />
          </div>
        </div>
      }
      previewTitle="Interactive Tabs"
      previewDescription="Navigate between different content sections"
      controlsTitle="Tab Configuration"
      controlsDescription="Customize tab appearance and behavior"
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
