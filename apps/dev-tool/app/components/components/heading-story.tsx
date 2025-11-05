'use client';

import { useState } from 'react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Heading } from '@portal/ui/heading';
import { Switch } from '@portal/ui/switch';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface HeadingStoryControls {
  customClass: boolean;
  showSample: boolean;
}

export default function HeadingStory() {
  const [controls, setControls] = useState<HeadingStoryControls>({
    customClass: false,
    showSample: true,
  });

  const generateCode = () => {
    const importStatement = generateImportStatement(
      ['Heading'],
      '@portal/ui/heading',
    );

    const headings = [1, 2, 3, 4, 5, 6]
      .map((level) => {
        const sampleText = controls.showSample
          ? sampleTexts[level as keyof typeof sampleTexts]
          : `Heading Level ${level}`;
        const customClassName = controls.customClass
          ? level === 1
            ? 'text-primary'
            : level === 2
              ? 'border-b-2 border-primary/20 pb-2'
              : level === 3
                ? 'text-muted-foreground'
                : 'text-accent-foreground'
          : '';

        const propsString = generatePropsString(
          {
            level: level,
            className: customClassName || undefined,
          },
          {
            level: 1,
          },
        );

        return `    <Heading${propsString}>${sampleText}</Heading>`;
      })
      .join('\n');

    const componentCode = `<div className="space-y-6">\n${headings}\n  </div>`;

    return `${importStatement}\n\n${componentCode}`;
  };

  const sampleTexts = {
    1: 'Main Page Title',
    2: 'Section Heading',
    3: 'Subsection Title',
    4: 'Component Title',
    5: 'Minor Heading',
    6: 'Small Heading',
  };

  const levelDescriptions = {
    1: 'Primary page title - largest and most prominent',
    2: 'Major section headings with bottom border',
    3: 'Subsection headings for content organization',
    4: 'Component or card titles',
    5: 'Minor headings and labels',
    6: 'Smallest heading level for subtle emphasis',
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Heading Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="customClass"
              checked={controls.customClass}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, customClass: checked }))
              }
            />
            <label htmlFor="customClass" className="text-sm">
              Add Custom Styling
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showSample"
              checked={controls.showSample}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, showSample: checked }))
              }
            />
            <label htmlFor="showSample" className="text-sm">
              Show Sample Text
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Heading Level Descriptions:</p>
          {Object.entries(levelDescriptions).map(([level, description]) => (
            <div key={level} className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">Level {level}:</p>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>All Heading Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <div key={level} className="space-y-3">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">H{level}</Badge>
                <span className="text-muted-foreground text-xs">
                  {levelDescriptions[level as keyof typeof levelDescriptions]}
                </span>
              </div>

              <Heading
                level={level as 1 | 2 | 3 | 4 | 5 | 6}
                className={
                  controls.customClass
                    ? 'text-primary border-primary/20 border-b-2 pb-2'
                    : undefined
                }
              >
                {controls.showSample
                  ? sampleTexts[level as keyof typeof sampleTexts]
                  : `Heading Level ${level}`}
              </Heading>

              <div className="bg-muted/50 rounded-lg p-3 text-xs">
                <code>
                  {`<h${level} className="font-heading scroll-m-20 ${
                    level === 1
                      ? 'text-3xl font-bold tracking-tight lg:text-4xl'
                      : level === 2
                        ? 'text-2xl font-semibold tracking-tight pb-2'
                        : level === 3
                          ? 'text-xl font-semibold tracking-tight lg:text-2xl'
                          : level === 4
                            ? 'text-lg font-semibold tracking-tight lg:text-xl'
                            : level === 5
                              ? 'text-base font-medium lg:text-lg'
                              : 'text-base font-medium'
                  }">`}
                  {controls.showSample
                    ? sampleTexts[level as keyof typeof sampleTexts]
                    : `Heading Level ${level}`}
                  {`</h${level}>`}
                </code>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Heading"
      previewDescription="Semantic heading component with responsive typography scaling"
      controlsTitle="Configuration"
      controlsDescription="Adjust heading level and styling options"
      generatedCode={generateCode()}
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Heading Hierarchy</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Heading level={1}>Page Title (H1)</Heading>
                <Heading level={2}>Major Section (H2)</Heading>
                <Heading level={3}>Subsection (H3)</Heading>
                <Heading level={4}>Component Title (H4)</Heading>
                <Heading level={5}>Minor Heading (H5)</Heading>
                <Heading level={6}>Small Heading (H6)</Heading>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Content Structure Example
            </h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Heading level={1}>Getting Started with React</Heading>
                <p className="text-muted-foreground">
                  Learn the fundamentals of React development and build your
                  first application.
                </p>

                <Heading level={2}>Installation</Heading>
                <p className="text-muted-foreground text-sm">
                  Before we begin, you'll need to set up your development
                  environment.
                </p>

                <Heading level={3}>Prerequisites</Heading>
                <p className="text-muted-foreground text-sm">
                  Make sure you have Node.js installed on your system.
                </p>

                <Heading level={4}>Node.js Version</Heading>
                <p className="text-muted-foreground text-sm">
                  We recommend using Node.js version 18 or higher.
                </p>

                <Heading level={3}>Creating Your Project</Heading>
                <p className="text-muted-foreground text-sm">
                  Use Create React App to bootstrap your new project.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Styled Headings</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Heading
                  level={1}
                  className="text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                >
                  Gradient Heading
                </Heading>

                <Heading level={2} className="border-l-4 border-blue-500 pl-4">
                  Accent Border Heading
                </Heading>

                <Heading
                  level={3}
                  className="bg-muted rounded-lg py-3 text-center"
                >
                  Centered with Background
                </Heading>

                <Heading
                  level={4}
                  className="text-muted-foreground tracking-wider uppercase"
                >
                  Uppercase Heading
                </Heading>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Blog Post Layout</h3>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Heading level={1}>The Future of Web Development</Heading>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Published on March 15, 2024 • 5 min read
                  </p>
                </div>

                <div className="space-y-4">
                  <Heading level={2}>Introduction</Heading>
                  <p className="text-muted-foreground text-sm">
                    Web development continues to evolve at a rapid pace...
                  </p>

                  <Heading level={2}>Key Technologies</Heading>
                  <div className="space-y-3">
                    <Heading level={3}>Frontend Frameworks</Heading>
                    <p className="text-muted-foreground text-sm">
                      Modern frameworks are becoming more powerful...
                    </p>

                    <Heading level={4}>React and Next.js</Heading>
                    <p className="text-muted-foreground text-sm">
                      React continues to dominate the frontend landscape...
                    </p>

                    <Heading level={4}>Vue and Nuxt</Heading>
                    <p className="text-muted-foreground text-sm">
                      Vue.js offers a progressive approach to building UIs...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Heading Props</h3>
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
                    <td className="p-2 font-mono">level</td>
                    <td className="p-2 font-mono">1 | 2 | 3 | 4 | 5 | 6</td>
                    <td className="p-2">1</td>
                    <td className="p-2">Semantic heading level (h1-h6)</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">children</td>
                    <td className="p-2 font-mono">React.ReactNode</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Heading content</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">className</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Heading Levels</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Level</th>
                    <th className="p-2 text-left font-medium">Element</th>
                    <th className="p-2 text-left font-medium">Font Size</th>
                    <th className="p-2 text-left font-medium">Use Case</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">1</td>
                    <td className="p-2 font-mono">h1</td>
                    <td className="p-2 font-mono">text-3xl lg:text-4xl</td>
                    <td className="p-2">Page titles, main headings</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">2</td>
                    <td className="p-2 font-mono">h2</td>
                    <td className="p-2 font-mono">text-2xl lg:text-3xl</td>
                    <td className="p-2">Major section headings</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">3</td>
                    <td className="p-2 font-mono">h3</td>
                    <td className="p-2 font-mono">text-xl lg:text-2xl</td>
                    <td className="p-2">Subsection headings</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">4</td>
                    <td className="p-2 font-mono">h4</td>
                    <td className="p-2 font-mono">text-lg lg:text-xl</td>
                    <td className="p-2">Component titles, cards</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">5</td>
                    <td className="p-2 font-mono">h5</td>
                    <td className="p-2 font-mono">text-base lg:text-lg</td>
                    <td className="p-2">Minor headings, labels</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">6</td>
                    <td className="p-2 font-mono">h6</td>
                    <td className="p-2 font-mono">text-base</td>
                    <td className="p-2">Small headings, captions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Typography Features</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Built-in Features</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Responsive sizing</Badge>
                  <Badge variant="secondary">Font heading family</Badge>
                  <Badge variant="secondary">Scroll margin</Badge>
                  <Badge variant="secondary">Semantic HTML</Badge>
                  <Badge variant="secondary">Tailwind classes</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  • <strong>scroll-m-20:</strong> Provides space for sticky
                  headers when scrolling to anchors
                </p>
                <p>
                  • <strong>tracking-tight:</strong> Improved letter spacing for
                  headings
                </p>
                <p>
                  • <strong>font-heading:</strong> Uses the heading font family
                  from theme
                </p>
                <p>
                  • <strong>Responsive:</strong> Automatically scales on larger
                  screens
                </p>
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
              Use semantic heading levels to create proper document structure
              and accessibility.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { Heading } from '@portal/ui/heading';

function Page() {
  return (
    <div>
      <Heading level={1}>Page Title</Heading>
      <Heading level={2}>Section Heading</Heading>
      <Heading level={3}>Subsection</Heading>
    </div>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Custom Styling</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`<Heading 
  level={2} 
  className="text-primary border-b-2 border-primary/20 pb-2"
>
  Custom Styled Heading
</Heading>

<Heading 
  level={3} 
  className="text-center bg-muted rounded-lg py-3"
>
  Centered with Background
</Heading>`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Accessibility Guidelines
            </h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Semantic Structure</h4>
                <p>• Use heading levels in logical order (don't skip levels)</p>
                <p>• Start with H1 for the main page title</p>
                <p>• Use only one H1 per page</p>
                <p>• Structure headings hierarchically (H1 → H2 → H3)</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Content Guidelines</h4>
                <p>• Keep headings concise and descriptive</p>
                <p>• Avoid using headings just for styling</p>
                <p>• Use consistent terminology</p>
                <p>• Consider screen reader users</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">SEO Benefits</h4>
                <p>• Proper heading structure improves SEO</p>
                <p>• Search engines use headings to understand content</p>
                <p>• Headings help with page scanning and navigation</p>
                <p>• Important keywords in headings carry more weight</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Structure</h4>
                <p>• Follow logical heading hierarchy</p>
                <p>• Don't skip heading levels</p>
                <p>• Use headings to create document outline</p>
                <p>• Keep headings short and descriptive</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Styling</h4>
                <p>• Use className prop for custom styles</p>
                <p>• Maintain visual hierarchy consistency</p>
                <p>• Consider responsive behavior</p>
                <p>• Test with different content lengths</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { HeadingStory };
