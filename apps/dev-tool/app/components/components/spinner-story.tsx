'use client';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import { Spinner } from '@portal/ui/spinner';

import {
  formatCodeBlock,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface SpinnerControls {
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeOptions = [
  { value: 'sm', label: 'Small', description: '16px (h-4 w-4)' },
  { value: 'md', label: 'Medium', description: '24px (h-6 w-6)' },
  { value: 'lg', label: 'Large', description: '32px (h-8 w-8)' },
  { value: 'xl', label: 'Extra Large', description: '48px (h-12 w-12)' },
];

const sizeClassMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function SpinnerStory() {
  const { controls, updateControl } = useStoryControls<SpinnerControls>({
    size: 'md',
  });

  const generateCode = () => {
    const className = sizeClassMap[controls.size];
    const propsString = generatePropsString(
      { className },
      { className: undefined },
    );

    return formatCodeBlock(`<Spinner${propsString} />`, [
      "import { Spinner } from '@portal/ui/spinner';",
    ]);
  };

  const renderPreview = () => (
    <div className="flex items-center justify-center p-8">
      <Spinner className={sizeClassMap[controls.size]} />
    </div>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="size">Size</Label>
        <SimpleStorySelect
          value={controls.size}
          onValueChange={(value) => updateControl('size', value as any)}
          options={sizeOptions}
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spinner Sizes</CardTitle>
          <CardDescription>
            Different spinner sizes for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center space-y-2">
              <Spinner className="h-4 w-4" />
              <span className="text-muted-foreground text-xs">Small</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Spinner className="h-6 w-6" />
              <span className="text-muted-foreground text-xs">Medium</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Spinner className="h-8 w-8" />
              <span className="text-muted-foreground text-xs">Large</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Spinner className="h-12 w-12" />
              <span className="text-muted-foreground text-xs">Extra Large</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Context</CardTitle>
          <CardDescription>Spinners in different contexts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Button Loading</h4>
            <Button className="gap-2" disabled>
              <Spinner className="h-4 w-4" />
              Loading...
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Card Loading</h4>
            <div className="flex items-center justify-center rounded-lg border p-6">
              <div className="space-y-2 text-center">
                <Spinner className="mx-auto h-6 w-6" />
                <p className="text-muted-foreground text-sm">Loading data...</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Page Loading</h4>
            <div className="flex items-center justify-center rounded-lg border p-16">
              <div className="space-y-4 text-center">
                <Spinner className="mx-auto h-8 w-8" />
                <p className="text-muted-foreground">Please wait...</p>
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
        <CardTitle>Spinner Component</CardTitle>
        <CardDescription>
          Complete API reference for Spinner component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Spinner</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A spinning loading indicator with accessible markup.
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
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes for styling</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">children</td>
                    <td className="p-3 font-mono text-sm">ReactNode</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Content to display (usually none)</td>
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
          <CardTitle>When to Use Spinner</CardTitle>
          <CardDescription>
            Best practices for loading indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Spinner For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • Short loading states (button loading, small data fetches)
              </li>
              <li>• Indeterminate progress indicators</li>
              <li>• Form submissions and API calls</li>
              <li>• Simple loading states without additional context</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Use Other Patterns For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Long loading processes (use progress bars)</li>
              <li>• Content loading (use skeleton screens)</li>
              <li>• File uploads with progress (use progress indicators)</li>
              <li>• Multi-step processes (use progress stepper)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Size Guidelines</CardTitle>
          <CardDescription>Choosing the right spinner size</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Small (h-4 w-4)</h4>
            <p className="text-muted-foreground text-sm">
              Button loading states, inline loading indicators
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Medium (h-6 w-6)</h4>
            <p className="text-muted-foreground text-sm">
              Card loading, component-level loading states
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Large (h-8 w-8)</h4>
            <p className="text-muted-foreground text-sm">
              Page-level loading, important loading states
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Extra Large (h-12 w-12)</h4>
            <p className="text-muted-foreground text-sm">
              Full-page loading screens, splash screens
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Making spinners accessible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Built-in Accessibility</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Includes role="status" for screen readers</li>
              <li>• SVG is properly hidden from screen readers</li>
              <li>• Inherits theme colors automatically</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Best Practices</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Provide context with surrounding text</li>
              <li>• Use aria-label or aria-describedby when needed</li>
              <li>• Ensure sufficient color contrast</li>
            </ul>
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
