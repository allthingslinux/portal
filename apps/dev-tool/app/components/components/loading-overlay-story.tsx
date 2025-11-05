'use client';

import { useState } from 'react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import { LoadingOverlay } from '@portal/ui/loading-overlay';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface LoadingOverlayControls {
  fullPage: boolean;
  showChildren: boolean;
  isLoading: boolean;
  displayLogo: boolean;
}

export function LoadingOverlayStory() {
  const { controls, updateControl } = useStoryControls<LoadingOverlayControls>({
    fullPage: false,
    showChildren: true,
    isLoading: false,
    displayLogo: false,
  });

  const [demoLoading, setDemoLoading] = useState(false);

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        fullPage: controls.fullPage,
        className: controls.fullPage ? undefined : 'h-48',
        spinnerClassName: 'h-6 w-6',
      },
      {
        fullPage: true,
        className: undefined,
        spinnerClassName: undefined,
      },
    );

    const children = controls.showChildren ? '\n  Loading your data...\n' : '';

    return `<LoadingOverlay${propsString}>${children}</LoadingOverlay>`;
  };

  const renderPreview = () => {
    if (controls.isLoading || demoLoading) {
      return (
        <LoadingOverlay
          fullPage={controls.fullPage}
          className={!controls.fullPage ? 'h-48' : undefined}
          spinnerClassName="h-6 w-6"
        >
          {controls.showChildren && 'Loading your data...'}
        </LoadingOverlay>
      );
    }

    return (
      <div className="bg-muted/20 flex h-48 items-center justify-center rounded-md border">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">Content loaded!</p>
          <Button onClick={() => setDemoLoading(true)}>
            Show Loading Overlay
          </Button>
        </div>
      </div>
    );
  };

  const renderControls = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="isLoading">Show Loading</Label>
        <Switch
          id="isLoading"
          checked={controls.isLoading}
          onCheckedChange={(checked) => updateControl('isLoading', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="fullPage">Full Page</Label>
        <Switch
          id="fullPage"
          checked={controls.fullPage}
          onCheckedChange={(checked) => updateControl('fullPage', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showChildren">Show Message</Label>
        <Switch
          id="showChildren"
          checked={controls.showChildren}
          onCheckedChange={(checked) => updateControl('showChildren', checked)}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Demo Controls</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDemoLoading(true);
            setTimeout(() => setDemoLoading(false), 3000);
          }}
          disabled={demoLoading}
        >
          {demoLoading ? 'Loading...' : 'Demo 3s Loading'}
        </Button>
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Container Loading</CardTitle>
          <CardDescription>
            Loading overlay within a specific container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <LoadingOverlay fullPage={false} className="h-32">
              Processing request...
            </LoadingOverlay>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Different Spinner Sizes</CardTitle>
          <CardDescription>
            Various spinner sizes for different contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 text-center">
              <div className="relative h-24 rounded border">
                <LoadingOverlay fullPage={false} spinnerClassName="h-4 w-4">
                  Small
                </LoadingOverlay>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="relative h-24 rounded border">
                <LoadingOverlay fullPage={false} spinnerClassName="h-6 w-6">
                  Medium
                </LoadingOverlay>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="relative h-24 rounded border">
                <LoadingOverlay fullPage={false} spinnerClassName="h-8 w-8">
                  Large
                </LoadingOverlay>
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
        <CardTitle>LoadingOverlay Component</CardTitle>
        <CardDescription>
          Complete API reference for LoadingOverlay component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">LoadingOverlay</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A loading overlay component with spinner and optional message.
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
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Loading message or content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">fullPage</td>
                    <td className="p-3 font-mono text-sm">boolean</td>
                    <td className="p-3 font-mono text-sm">true</td>
                    <td className="p-3">Cover entire screen or container</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">spinnerClassName</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">CSS classes for spinner</td>
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
          <CardTitle>When to Use LoadingOverlay</CardTitle>
          <CardDescription>Best practices for loading overlays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use LoadingOverlay For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Async operations that take more than 1-2 seconds</li>
              <li>• Form submissions and API calls</li>
              <li>• Page transitions and navigation</li>
              <li>• File uploads and downloads</li>
              <li>• Data processing operations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Avoid LoadingOverlay For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Very quick operations (&lt; 500ms)</li>
              <li>• Background tasks that don't block UI</li>
              <li>• Real-time updates (use skeleton instead)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UX Guidelines</CardTitle>
          <CardDescription>Creating better loading experiences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Provide Context</h4>
            <p className="text-muted-foreground text-sm">
              Always include a meaningful message about what's loading.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Use Appropriate Size</h4>
            <p className="text-muted-foreground text-sm">
              fullPage for navigation, container-scoped for component loading.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Timeout Handling</h4>
            <p className="text-muted-foreground text-sm">
              Consider showing error states for long-running operations.
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
