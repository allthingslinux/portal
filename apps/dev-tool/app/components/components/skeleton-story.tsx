'use client';

import { useState } from 'react';

import { UserIcon } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Skeleton } from '@portal/ui/skeleton';
import { Switch } from '@portal/ui/switch';

import {
  generateImportStatement,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface SkeletonStoryControls {
  animating: boolean;
  variant: 'default' | 'rounded' | 'circle';
  size: 'sm' | 'md' | 'lg' | 'xl';
  showDemo: boolean;
}

export default function SkeletonStory() {
  const { controls, updateControl } = useStoryControls<SkeletonStoryControls>({
    animating: true,
    variant: 'default',
    size: 'md',
    showDemo: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        className: `${sizeClasses[controls.size].width} ${sizeClasses[controls.size].height} ${variantClasses[controls.variant]}${!controls.animating ? ' animate-none' : ''}`,
      },
      {},
    );

    const imports = generateImportStatement(['Skeleton'], '@portal/ui/skeleton');

    return `${imports}\n\nfunction LoadingComponent() {\n  return (\n    <div className="space-y-3">\n      <Skeleton${propsString} />\n      <Skeleton className="h-4 w-3/4" />\n      <Skeleton className="h-4 w-1/2" />\n    </div>\n  );\n}`;
  };

  const sizeClasses = {
    sm: { width: 'w-20', height: 'h-4' },
    md: { width: 'w-32', height: 'h-5' },
    lg: { width: 'w-48', height: 'h-6' },
    xl: { width: 'w-64', height: 'h-8' },
  };

  const variantClasses = {
    default: 'rounded-md',
    rounded: 'rounded-lg',
    circle: 'rounded-full aspect-square',
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Skeleton Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Variant</label>
            <Select
              value={controls.variant}
              onValueChange={(value: SkeletonStoryControls['variant']) =>
                updateControl('variant', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Size</label>
            <Select
              value={controls.size}
              onValueChange={(value: SkeletonStoryControls['size']) =>
                updateControl('size', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="animating"
              checked={controls.animating}
              onCheckedChange={(checked) => updateControl('animating', checked)}
            />
            <label htmlFor="animating" className="text-sm">
              Animation
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showDemo"
              checked={controls.showDemo}
              onCheckedChange={(checked) => updateControl('showDemo', checked)}
            />
            <label htmlFor="showDemo" className="text-sm">
              Show Loading Demo
            </label>
          </div>
        </div>

        {controls.showDemo && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Loading Demo:</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLoading(!isLoading)}
              >
                {isLoading ? 'Show Content' : 'Show Loading'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>Skeleton Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block text-base font-semibold">
              Basic Skeleton
            </Label>

            <div className="flex items-center gap-4">
              <Skeleton
                className={` ${sizeClasses[controls.size].width} ${sizeClasses[controls.size].height} ${variantClasses[controls.variant]} ${!controls.animating ? 'animate-none' : ''} `}
              />
              <div className="text-muted-foreground text-sm">
                {controls.variant} variant, {controls.size} size
              </div>
            </div>
          </div>

          {controls.showDemo && (
            <div>
              <Label className="mb-3 block text-base font-semibold">
                Loading State Demo
              </Label>

              <Card>
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                        <UserIcon className="text-primary h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-muted-foreground text-sm">
                          Software Engineer
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      generatedCode={generateCode()}
      previewTitle="Interactive Skeleton"
      previewDescription="Loading placeholder with customizable variants and animation states"
      controlsTitle="Configuration"
      controlsDescription="Adjust variant, size, and animation behavior"
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Skeletons</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Text Skeletons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shape Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <span className="text-sm">Circle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-20 rounded-md" />
                    <span className="text-sm">Rectangle</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-20 rounded-lg" />
                    <span className="text-sm">Rounded</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Card Layout Loading</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Article Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Data Table Loading</h3>
            <Card>
              <CardHeader>
                <CardTitle>Table Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-4 border-b pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-18" />
                  </div>
                  {/* Table rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Dashboard Loading</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="mb-2 h-8 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Social Media Feed</h3>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="mb-4 h-48 w-full rounded-lg" />
                    <div className="flex justify-between">
                      <div className="flex space-x-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-8 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Skeleton Component</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Component</th>
                    <th className="p-2 text-left font-medium">Props</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">Skeleton</td>
                    <td className="p-2 font-mono">
                      className, ...HTMLDivElement props
                    </td>
                    <td className="p-2">Loading placeholder component</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Skeleton Props</h3>
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
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">className</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Additional CSS classes</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">...props</td>
                    <td className="p-2 font-mono">HTMLDivElement</td>
                    <td className="p-2">-</td>
                    <td className="p-2">All standard div element props</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Animation States</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Built-in Classes</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">animate-pulse (default)</Badge>
                  <Badge variant="secondary">animate-none (disabled)</Badge>
                  <Badge variant="secondary">bg-primary/10 (background)</Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Default animated
<Skeleton className="h-4 w-32" />

// No animation
<Skeleton className="h-4 w-32 animate-none" />

// Custom background
<Skeleton className="h-4 w-32 bg-muted" />`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Common Shapes</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Shape Utilities</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">rounded-md (default)</Badge>
                  <Badge variant="secondary">
                    rounded-full (circle/avatar)
                  </Badge>
                  <Badge variant="secondary">rounded-lg (cards/images)</Badge>
                  <Badge variant="secondary">aspect-square (square)</Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Text skeleton
<Skeleton className="h-4 w-64" />

// Avatar skeleton
<Skeleton className="h-10 w-10 rounded-full" />

// Image skeleton  
<Skeleton className="h-32 w-full rounded-lg" />

// Square skeleton
<Skeleton className="h-16 w-16 rounded-lg" />`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      }
      usageGuidelines={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Usage</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Skeleton components provide visual placeholders during content
              loading states, maintaining layout structure and improving
              perceived performance.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { Skeleton } from '@portal/ui/skeleton';

function LoadingCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Loading State Patterns
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`function ProfileCard({ isLoading, user }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar src={user.avatar} />
          <div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">List Loading</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Layout Preservation</h4>
                <p>• Match skeleton dimensions to actual content</p>
                <p>• Maintain consistent spacing and alignment</p>
                <p>• Use similar border radius to final content</p>
                <p>• Preserve container structures</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Performance Considerations</h4>
                <p>• Use skeletons for content that takes {'>'}200ms to load</p>
                <p>• Avoid skeletons for instant state changes</p>
                <p>• Consider progressive loading for better UX</p>
                <p>• Limit skeleton complexity for performance</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Accessibility</h4>
                <p>• Add aria-label or aria-describedby for screen readers</p>
                <p>• Consider aria-live regions for dynamic loading states</p>
                <p>• Ensure sufficient color contrast</p>
                <p>• Test with screen reader and keyboard navigation</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Animation Guidelines</h4>
                <p>• Use default pulse animation for most cases</p>
                <p>• Disable animation for users who prefer reduced motion</p>
                <p>• Keep animation subtle and consistent</p>
                <p>• Consider wave or shimmer effects for long content</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { SkeletonStory };
