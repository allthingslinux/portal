'use client';

import { Eye, Heart, MoreHorizontal, Star, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@portal/ui/avatar';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Progress } from '@portal/ui/progress';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';
import { cn } from '@portal/ui/utils';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface CardControls {
  showHeader: boolean;
  showFooter: boolean;
  headerTitle: string;
  headerDescription: string;
  footerContent: 'buttons' | 'text' | 'none';
  variant: 'default' | 'stats' | 'profile' | 'feature';
  className: string;
  padding: 'default' | 'sm' | 'lg' | 'none';
  elevation: 'default' | 'sm' | 'lg' | 'none';
  interactive: boolean;
}

const variantOptions = [
  { value: 'default', label: 'Default', description: 'Standard card layout' },
  {
    value: 'stats',
    label: 'Stats',
    description: 'Card optimized for statistics',
  },
  { value: 'profile', label: 'Profile', description: 'Card for user profiles' },
  {
    value: 'feature',
    label: 'Feature',
    description: 'Card for features/products',
  },
] as const;

const paddingOptions = [
  { value: 'none', label: 'None', description: 'No padding' },
  { value: 'sm', label: 'Small', description: '12px padding' },
  { value: 'default', label: 'Default', description: '24px padding' },
  { value: 'lg', label: 'Large', description: '32px padding' },
] as const;

const elevationOptions = [
  { value: 'none', label: 'None', description: 'No shadow' },
  { value: 'sm', label: 'Small', description: 'Subtle shadow' },
  { value: 'default', label: 'Default', description: 'Standard shadow' },
  { value: 'lg', label: 'Large', description: 'Prominent shadow' },
] as const;

const footerContentOptions = [
  { value: 'none', label: 'None', description: 'No footer content' },
  { value: 'text', label: 'Text', description: 'Simple text footer' },
  { value: 'buttons', label: 'Buttons', description: 'Action buttons' },
] as const;

export function CardStory() {
  const { controls, updateControl } = useStoryControls<CardControls>({
    showHeader: true,
    showFooter: true,
    headerTitle: 'Card Title',
    headerDescription: 'Card description goes here',
    footerContent: 'buttons',
    variant: 'default',
    className: '',
    padding: 'default',
    elevation: 'default',
    interactive: false,
  });

  const generateCode = () => {
    const cardClassName = cn(
      controls.className,
      controls.padding === 'none' && '[&>*]:p-0',
      controls.padding === 'sm' && '[&>*]:p-3',
      controls.padding === 'lg' && '[&>*]:p-8',
      controls.elevation === 'none' && 'shadow-none',
      controls.elevation === 'sm' && 'shadow-sm',
      controls.elevation === 'lg' && 'shadow-lg',
      controls.interactive &&
        'cursor-pointer transition-shadow hover:shadow-md',
    );

    const propsString = generatePropsString(
      {
        className: cardClassName,
      },
      {
        className: '',
      },
    );

    let code = `<Card${propsString}>`;

    if (controls.showHeader) {
      code += `\n  <CardHeader>`;
      code += `\n    <CardTitle>${controls.headerTitle}</CardTitle>`;
      if (controls.headerDescription) {
        code += `\n    <CardDescription>${controls.headerDescription}</CardDescription>`;
      }
      code += `\n  </CardHeader>`;
    }

    code += `\n  <CardContent>`;
    if (controls.variant === 'stats') {
      code += `\n    <div className="flex items-center justify-between">`;
      code += `\n      <div>`;
      code += `\n        <p className="text-2xl font-bold">1,234</p>`;
      code += `\n        <p className="text-sm text-muted-foreground">Total Users</p>`;
      code += `\n      </div>`;
      code += `\n      <User className="h-8 w-8 text-muted-foreground" />`;
      code += `\n    </div>`;
    } else if (controls.variant === 'profile') {
      code += `\n    <div className="flex items-center gap-4">`;
      code += `\n      <Avatar>`;
      code += `\n        <AvatarImage src="/placeholder.jpg" />`;
      code += `\n        <AvatarFallback>JD</AvatarFallback>`;
      code += `\n      </Avatar>`;
      code += `\n      <div>`;
      code += `\n        <h3 className="font-semibold">John Doe</h3>`;
      code += `\n        <p className="text-sm text-muted-foreground">Software Developer</p>`;
      code += `\n      </div>`;
      code += `\n    </div>`;
    } else if (controls.variant === 'feature') {
      code += `\n    <div className="space-y-2">`;
      code += `\n      <Badge variant="secondary">New</Badge>`;
      code += `\n      <h3 className="font-semibold">Amazing Feature</h3>`;
      code += `\n      <p className="text-sm text-muted-foreground">This feature will revolutionize your workflow.</p>`;
      code += `\n    </div>`;
    } else {
      code += `\n    <p>Your content here</p>`;
    }
    code += `\n  </CardContent>`;

    if (controls.showFooter && controls.footerContent !== 'none') {
      code += `\n  <CardFooter>`;
      if (controls.footerContent === 'buttons') {
        code += `\n    <div className="flex gap-2">`;
        code += `\n      <Button size="sm">Primary</Button>`;
        code += `\n      <Button variant="outline" size="sm">Secondary</Button>`;
        code += `\n    </div>`;
      } else {
        code += `\n    <p className="text-sm text-muted-foreground">Footer text</p>`;
      }
      code += `\n  </CardFooter>`;
    }

    code += `\n</Card>`;

    return code;
  };

  const renderPreview = () => {
    const cardClassName = cn(
      controls.className,
      controls.padding === 'none' && '[&>*]:p-0',
      controls.padding === 'sm' && '[&>*]:p-3',
      controls.padding === 'lg' && '[&>*]:p-8',
      controls.elevation === 'none' && 'shadow-none',
      controls.elevation === 'sm' && 'shadow-sm',
      controls.elevation === 'lg' && 'shadow-lg',
      controls.interactive &&
        'cursor-pointer transition-shadow hover:shadow-md',
    );

    return (
      <Card className={cardClassName} style={{ maxWidth: '400px' }}>
        {controls.showHeader && (
          <CardHeader>
            <CardTitle>{controls.headerTitle}</CardTitle>
            {controls.headerDescription && (
              <CardDescription>{controls.headerDescription}</CardDescription>
            )}
          </CardHeader>
        )}

        <CardContent>
          {controls.variant === 'stats' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-muted-foreground text-sm">Total Users</p>
              </div>
              <User className="text-muted-foreground h-8 w-8" />
            </div>
          )}

          {controls.variant === 'profile' && (
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-muted-foreground text-sm">
                  Software Developer
                </p>
              </div>
            </div>
          )}

          {controls.variant === 'feature' && (
            <div className="space-y-2">
              <Badge variant="secondary">New</Badge>
              <h3 className="font-semibold">Amazing Feature</h3>
              <p className="text-muted-foreground text-sm">
                This feature will revolutionize your workflow.
              </p>
            </div>
          )}

          {controls.variant === 'default' && <p>Your content here</p>}
        </CardContent>

        {controls.showFooter && controls.footerContent !== 'none' && (
          <CardFooter>
            {controls.footerContent === 'buttons' ? (
              <div className="flex gap-2">
                <Button size="sm">Primary</Button>
                <Button variant="outline" size="sm">
                  Secondary
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Footer text</p>
            )}
          </CardFooter>
        )}
      </Card>
    );
  };

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="variant">Variant</Label>
        <SimpleStorySelect
          value={controls.variant}
          onValueChange={(value) => updateControl('variant', value)}
          options={variantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="padding">Padding</Label>
        <SimpleStorySelect
          value={controls.padding}
          onValueChange={(value) => updateControl('padding', value)}
          options={paddingOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="elevation">Elevation</Label>
        <SimpleStorySelect
          value={controls.elevation}
          onValueChange={(value) => updateControl('elevation', value)}
          options={elevationOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="showHeader">Show Header</Label>
        <Switch
          id="showHeader"
          checked={controls.showHeader}
          onCheckedChange={(checked) => updateControl('showHeader', checked)}
        />
      </div>

      {controls.showHeader && (
        <>
          <div className="space-y-2">
            <Label htmlFor="headerTitle">Header Title</Label>
            <Input
              id="headerTitle"
              value={controls.headerTitle}
              onChange={(e) => updateControl('headerTitle', e.target.value)}
              placeholder="Card title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headerDescription">Header Description</Label>
            <Textarea
              id="headerDescription"
              value={controls.headerDescription}
              onChange={(e) =>
                updateControl('headerDescription', e.target.value)
              }
              placeholder="Card description"
              rows={2}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="showFooter">Show Footer</Label>
        <Switch
          id="showFooter"
          checked={controls.showFooter}
          onCheckedChange={(checked) => updateControl('showFooter', checked)}
        />
      </div>

      {controls.showFooter && (
        <div className="space-y-2">
          <Label htmlFor="footerContent">Footer Content</Label>
          <SimpleStorySelect
            value={controls.footerContent}
            onValueChange={(value) => updateControl('footerContent', value)}
            options={footerContentOptions}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="interactive">Interactive</Label>
        <Switch
          id="interactive"
          checked={controls.interactive}
          onCheckedChange={(checked) => updateControl('interactive', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Custom Classes</Label>
        <Input
          id="className"
          value={controls.className}
          onChange={(e) => updateControl('className', e.target.value)}
          placeholder="e.g. border-2 bg-accent"
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Card Variants</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                Basic card layout with header and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This is a standard card with header, content, and footer
                sections.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-muted-foreground text-sm">Active Users</p>
                </div>
                <User className="text-muted-foreground h-8 w-8" />
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-2" />
                <p className="text-muted-foreground mt-2 text-xs">
                  75% of goal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">Sarah Anderson</h3>
                  <p className="text-muted-foreground text-sm">
                    Product Manager
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Featured</Badge>
                  <Heart className="text-muted-foreground h-4 w-4" />
                </div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Get detailed insights into your application performance with
                  our advanced analytics dashboard.
                </p>
                <div className="flex items-center gap-2">
                  <Eye className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm">
                    1.2k views
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderApiReference = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-lg font-semibold">Card</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Container component for grouping related content with optional header
          and footer.
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
                <td className="p-3">Additional CSS classes</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-sm">children</td>
                <td className="p-3 font-mono text-sm">ReactNode</td>
                <td className="p-3 font-mono text-sm">-</td>
                <td className="p-3">Card content</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">CardHeader</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Optional header section for the card, typically containing title and
          description.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">CardTitle</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Main heading for the card header.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">CardDescription</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Descriptive text that appears below the card title.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">CardContent</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Main content area of the card.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">CardFooter</h4>
        <p className="text-muted-foreground mb-3 text-sm">
          Optional footer section, typically containing actions or additional
          information.
        </p>
      </div>
    </div>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <div>
        <h4 className="mb-3 text-lg font-semibold">When to Use Cards</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-green-700">
              ✅ Use Cards For
            </h5>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Grouping related information and actions</li>
              <li>• Displaying content that needs to stand out</li>
              <li>• Creating scannable layouts with distinct sections</li>
              <li>• Product listings, user profiles, or feature highlights</li>
              <li>• Dashboard widgets and statistics</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-red-700">
              ❌ Avoid Cards For
            </h5>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Single pieces of text or data</li>
              <li>• Navigation menus or button groups</li>
              <li>• Content that flows naturally together</li>
              <li>• Overly complex or cluttered information</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">
          Card Structure Best Practices
        </h4>
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-semibold">Header</h5>
            <p className="text-muted-foreground text-sm">
              Keep titles concise and descriptive. Use descriptions for
              additional context when needed.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Content</h5>
            <p className="text-muted-foreground text-sm">
              Focus on the most important information. Use visual hierarchy to
              guide the user's attention.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Footer</h5>
            <p className="text-muted-foreground text-sm">
              Include primary actions or supplementary information. Limit to 1-2
              primary actions.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">Accessibility</h4>
        <div className="space-y-2">
          <div>
            <h5 className="text-sm font-semibold">Semantic Structure</h5>
            <p className="text-muted-foreground text-sm">
              Use proper heading hierarchy (h1-h6) for card titles and sections.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Interactive Cards</h5>
            <p className="text-muted-foreground text-sm">
              If the entire card is clickable, ensure it has proper focus states
              and keyboard navigation support.
            </p>
          </div>
        </div>
      </div>
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
