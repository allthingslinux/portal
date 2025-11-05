'use client';

import { useEffect, useState } from 'react';

import { Download, Pause, Play, RotateCcw, Upload, Zap } from 'lucide-react';

import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { Progress } from '@portal/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Slider } from '@portal/ui/slider';
import { Switch } from '@portal/ui/switch';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface ProgressControlsProps {
  value: number;
  max: number;
  className: string;
  size: 'sm' | 'default' | 'lg';
  variant: 'default' | 'success' | 'warning' | 'error';
  animated: boolean;
  showLabel: boolean;
  indeterminate: boolean;
  onValueChange: (value: number) => void;
  onMaxChange: (max: number) => void;
  onClassNameChange: (className: string) => void;
  onSizeChange: (size: 'sm' | 'default' | 'lg') => void;
  onVariantChange: (
    variant: 'default' | 'success' | 'warning' | 'error',
  ) => void;
  onAnimatedChange: (animated: boolean) => void;
  onShowLabelChange: (showLabel: boolean) => void;
  onIndeterminateChange: (indeterminate: boolean) => void;
}

const progressControls = [
  {
    name: 'value',
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    description: 'Current progress value',
  },
  {
    name: 'max',
    type: 'range',
    min: 50,
    max: 200,
    step: 10,
    description: 'Maximum progress value',
  },
  {
    name: 'size',
    type: 'select',
    options: ['sm', 'default', 'lg'],
    description: 'Progress bar size',
  },
  {
    name: 'variant',
    type: 'select',
    options: ['default', 'success', 'warning', 'error'],
    description: 'Progress bar color variant',
  },
  {
    name: 'animated',
    type: 'boolean',
    description: 'Enable animated progress bar',
  },
  {
    name: 'showLabel',
    type: 'boolean',
    description: 'Show percentage label',
  },
  {
    name: 'indeterminate',
    type: 'boolean',
    description: 'Indeterminate/loading state',
  },
  {
    name: 'className',
    type: 'text',
    description: 'Additional CSS classes',
  },
];

const sizeClasses = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-4',
};

const variantClasses = {
  default: '',
  success: '[&>*]:bg-green-500',
  warning: '[&>*]:bg-yellow-500',
  error: '[&>*]:bg-red-500',
};

function ProgressPlayground({
  value,
  max,
  className,
  size,
  variant,
  animated,
  showLabel,
  indeterminate,
}: ProgressControlsProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (indeterminate) return;

    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value, indeterminate]);

  const displayValue = indeterminate
    ? undefined
    : animated
      ? animatedValue
      : value;
  const percentage = indeterminate
    ? 0
    : Math.round((displayValue! / max) * 100);

  return (
    <div className="space-y-4">
      {showLabel && !indeterminate && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}

      <Progress
        value={displayValue}
        max={max}
        className={` ${sizeClasses[size]} ${variantClasses[variant]} ${indeterminate ? 'animate-pulse [&>*]:w-1/3 [&>*]:translate-x-0 [&>*]:animate-pulse' : ''} ${animated ? 'transition-all duration-500 ease-out' : ''} ${className} `}
      />

      {showLabel && indeterminate && (
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      )}
    </div>
  );
}

const examples = [
  {
    title: 'File Upload Progress',
    description: 'Track file upload with success state and percentage display',
    component: () => {
      const [progress, setProgress] = useState(0);
      const [isUploading, setIsUploading] = useState(false);

      const startUpload = () => {
        setIsUploading(true);
        setProgress(0);

        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              setIsUploading(false);
              clearInterval(interval);
              return 100;
            }
            return prev + Math.random() * 15;
          });
        }, 300);
      };

      const reset = () => {
        setProgress(0);
        setIsUploading(false);
      };

      return (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>

              <Progress
                value={progress}
                className={`h-2 transition-all duration-300 ${
                  progress === 100 ? '[&>*]:bg-green-500' : ''
                }`}
              />

              {progress === 100 && (
                <p className="text-sm font-medium text-green-600">
                  Upload completed successfully!
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startUpload}
                disabled={isUploading || progress === 100}
                size="sm"
              >
                {isUploading ? 'Uploading...' : 'Start Upload'}
              </Button>

              <Button onClick={reset} variant="outline" size="sm">
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Download Manager',
    description: 'Multiple progress bars with different states and sizes',
    component: () => {
      const downloads = [
        {
          id: 1,
          name: 'Project Files.zip',
          progress: 100,
          size: 'default' as const,
          variant: 'success' as const,
        },
        {
          id: 2,
          name: 'Software Update.dmg',
          progress: 67,
          size: 'default' as const,
          variant: 'default' as const,
        },
        {
          id: 3,
          name: 'Documentation.pdf',
          progress: 23,
          size: 'default' as const,
          variant: 'warning' as const,
        },
        {
          id: 4,
          name: 'Failed Download.exe',
          progress: 45,
          size: 'default' as const,
          variant: 'error' as const,
        },
      ];

      return (
        <Card className="w-full max-w-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" />
              Download Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {downloads.map((download) => (
              <div key={download.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{download.name}</span>
                  <span className="text-muted-foreground">
                    {download.progress}%
                  </span>
                </div>

                <Progress
                  value={download.progress}
                  className={`h-2 ${variantClasses[download.variant]}`}
                />

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>
                    {download.progress === 100
                      ? 'Completed'
                      : download.variant === 'error'
                        ? 'Failed'
                        : 'Downloading...'}
                  </span>
                  <span>{download.progress}/100</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Skill Levels',
    description:
      'Progress bars showing different skill levels with custom styling',
    component: () => {
      const skills = [
        { name: 'React', level: 90, color: '[&>*]:bg-blue-500' },
        { name: 'TypeScript', level: 85, color: '[&>*]:bg-blue-600' },
        { name: 'Node.js', level: 75, color: '[&>*]:bg-green-600' },
        { name: 'Python', level: 60, color: '[&>*]:bg-yellow-500' },
        { name: 'Go', level: 40, color: '[&>*]:bg-cyan-500' },
      ];

      return (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Skills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level}%</span>
                </div>

                <Progress
                  value={skill.level}
                  className={`h-2 ${skill.color}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      );
    },
  },
  {
    title: 'Loading States',
    description: 'Indeterminate progress for unknown durations',
    component: () => {
      const [states, setStates] = useState({
        processing: true,
        analyzing: true,
        syncing: true,
      });

      const toggleState = (key: keyof typeof states) => {
        setStates((prev) => ({ ...prev, [key]: !prev[key] }));
      };

      return (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Loading Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing data...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleState('processing')}
                >
                  {states.processing ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>

              <Progress
                value={states.processing ? undefined : 0}
                className={`h-2 ${states.processing ? 'animate-pulse [&>*]:w-1/3 [&>*]:translate-x-0 [&>*]:animate-pulse' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analyzing files...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleState('analyzing')}
                >
                  {states.analyzing ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>

              <Progress
                value={states.analyzing ? undefined : 0}
                className={`h-2 [&>*]:bg-orange-500 ${states.analyzing ? 'animate-pulse [&>*]:w-1/3 [&>*]:translate-x-0 [&>*]:animate-pulse' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Syncing changes...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleState('syncing')}
                >
                  {states.syncing ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>

              <Progress
                value={states.syncing ? undefined : 0}
                className={`h-2 [&>*]:bg-purple-500 ${states.syncing ? 'animate-pulse [&>*]:w-1/3 [&>*]:translate-x-0 [&>*]:animate-pulse' : ''}`}
              />
            </div>
          </CardContent>
        </Card>
      );
    },
  },
];

const apiReference = {
  title: 'Progress API Reference',
  description: 'Complete API documentation for the Progress component.',
  props: [
    {
      name: 'value',
      type: 'number | undefined',
      default: 'undefined',
      description:
        'The current progress value. Use undefined for indeterminate state.',
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'The maximum progress value.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes to apply to the progress container.',
    },
    {
      name: '...props',
      type: 'React.ComponentProps<typeof ProgressPrimitive.Root>',
      description:
        'All props from Radix UI Progress.Root component including aria-label, aria-labelledby, aria-describedby, etc.',
    },
  ],
  examples: [
    {
      title: 'Basic Usage',
      code: `import { Progress } from '@portal/ui/progress';

<Progress value={75} />`,
    },
    {
      title: 'Custom Maximum',
      code: `<Progress value={150} max={200} />`,
    },
    {
      title: 'Indeterminate State',
      code: `<Progress value={undefined} className="animate-pulse" />`,
    },
    {
      title: 'Custom Styling',
      code: `<Progress 
  value={60} 
  className="h-4 [&>*]:bg-gradient-to-r [&>*]:from-blue-500 [&>*]:to-purple-600" 
/>`,
    },
  ],
};

const usageGuidelines = {
  title: 'Progress Usage Guidelines',
  description:
    'Best practices for implementing progress indicators effectively.',
  guidelines: [
    {
      title: 'When to Use Progress',
      items: [
        'File uploads, downloads, or data transfers',
        'Multi-step processes or forms',
        'Loading operations with known duration',
        'Skill levels or completion percentages',
        'System resource usage (storage, memory)',
      ],
    },
    {
      title: 'Progress Types',
      items: [
        'Determinate: Use when you know the total and current progress',
        'Indeterminate: Use for unknown durations or when progress cannot be measured',
        'Buffering: Show both loaded and buffered content (video players)',
        'Stepped: Discrete progress through defined stages',
      ],
    },
    {
      title: 'Visual Design',
      items: [
        'Use appropriate height: thin for subtle progress, thick for prominent indicators',
        'Choose colors that match the context (success green, warning yellow, error red)',
        'Consider animation for smooth visual feedback',
        'Provide clear labels showing current state and percentage when helpful',
        'Ensure sufficient contrast for accessibility',
      ],
    },
    {
      title: 'User Experience',
      items: [
        'Always provide feedback during long operations',
        'Show percentage or time estimates when possible',
        'Allow users to cancel or pause lengthy operations',
        'Use progress bars consistently across similar operations',
        'Consider showing multiple progress indicators for complex operations',
      ],
    },
    {
      title: 'Accessibility',
      items: [
        'Progress elements are automatically announced by screen readers',
        'Provide meaningful aria-label or aria-labelledby attributes',
        'Use role="progressbar" for semantic clarity',
        'Include text alternatives for purely visual progress indicators',
        'Ensure progress updates are announced to assistive technologies',
      ],
    },
  ],
};

export default function ProgressStory() {
  const [controls, setControls] = useState({
    value: 65,
    max: 100,
    className: '',
    size: 'default' as 'sm' | 'default' | 'lg',
    variant: 'default' as 'default' | 'success' | 'warning' | 'error',
    animated: true,
    showLabel: true,
    indeterminate: false,
  });

  const generateCode = () => {
    const displayValue = controls.indeterminate ? undefined : controls.value;
    const sizeClass = sizeClasses[controls.size];
    const variantClass = variantClasses[controls.variant];
    const animationClass = controls.indeterminate
      ? 'animate-pulse [&>*]:animate-pulse [&>*]:w-1/3 [&>*]:translate-x-0'
      : '';
    const transitionClass =
      controls.animated && !controls.indeterminate
        ? 'transition-all duration-500 ease-out'
        : '';

    const className = [
      sizeClass,
      variantClass,
      animationClass,
      transitionClass,
      controls.className,
    ]
      .filter(Boolean)
      .join(' ');

    const propsString = generatePropsString(
      {
        value: displayValue,
        max: controls.max !== 100 ? controls.max : undefined,
        className: className || undefined,
      },
      {
        value: undefined,
        max: 100,
        className: '',
      },
    );

    const importStatement = generateImportStatement(
      ['Progress'],
      '@portal/ui/progress',
    );
    const progressComponent = `<Progress${propsString} />`;

    let fullExample = progressComponent;

    // Add label wrapper if showLabel is enabled
    if (controls.showLabel) {
      const percentage = controls.indeterminate
        ? 0
        : Math.round((displayValue! / controls.max) * 100);
      const labelText = controls.indeterminate
        ? 'Loading...'
        : `${percentage}%`;

      fullExample = `<div className="space-y-4">
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">Progress</span>
    <span className="font-medium">${labelText}</span>
  </div>
  ${progressComponent}
</div>`;
    }

    return `${importStatement}

${fullExample}`;
  };

  const controlsContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="progress-value">Progress Value</Label>
        <Slider
          id="progress-value"
          min={[0]}
          max={[controls.max]}
          step={[1]}
          value={[controls.value]}
          onValueChange={([value]) =>
            setControls((prev) => ({ ...prev, value }))
          }
          disabled={controls.indeterminate}
        />
        <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>0</span>
          <span>{controls.value}</span>
          <span>{controls.max}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-value">Maximum Value</Label>
        <Slider
          id="max-value"
          min={[50]}
          max={[200]}
          step={[10]}
          value={[controls.max]}
          onValueChange={([max]) => setControls((prev) => ({ ...prev, max }))}
        />
        <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>50</span>
          <span>{controls.max}</span>
          <span>200</span>
        </div>
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
        <Label htmlFor="variant">Variant</Label>
        <Select
          value={controls.variant}
          onValueChange={(value: 'default' | 'success' | 'warning' | 'error') =>
            setControls((prev) => ({ ...prev, variant: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="animated">Animated</Label>
          <Switch
            id="animated"
            checked={controls.animated}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, animated: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLabel">Show Label</Label>
          <Switch
            id="showLabel"
            checked={controls.showLabel}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, showLabel: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="indeterminate">Indeterminate</Label>
          <Switch
            id="indeterminate"
            checked={controls.indeterminate}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, indeterminate: checked }))
            }
          />
        </div>
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
      <ProgressPlayground
        value={controls.value}
        max={controls.max}
        className={controls.className}
        size={controls.size}
        variant={controls.variant}
        animated={controls.animated}
        showLabel={controls.showLabel}
        indeterminate={controls.indeterminate}
        onValueChange={(value) => setControls((prev) => ({ ...prev, value }))}
        onMaxChange={(max) => setControls((prev) => ({ ...prev, max }))}
        onClassNameChange={(className) =>
          setControls((prev) => ({ ...prev, className }))
        }
        onSizeChange={(size) => setControls((prev) => ({ ...prev, size }))}
        onVariantChange={(variant) =>
          setControls((prev) => ({ ...prev, variant }))
        }
        onAnimatedChange={(animated) =>
          setControls((prev) => ({ ...prev, animated }))
        }
        onShowLabelChange={(showLabel) =>
          setControls((prev) => ({ ...prev, showLabel }))
        }
        onIndeterminateChange={(indeterminate) =>
          setControls((prev) => ({ ...prev, indeterminate }))
        }
      />
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Progress"
      previewDescription="Visual indicator showing task completion progress"
      controlsTitle="Progress Configuration"
      controlsDescription="Customize progress appearance and behavior"
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
