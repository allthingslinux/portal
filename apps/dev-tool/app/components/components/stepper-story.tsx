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
import { Separator } from '@portal/ui/separator';
import { Stepper } from '@portal/ui/stepper';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface StepperControls {
  variant: 'default' | 'numbers' | 'dots';
  currentStep: number;
  stepCount: number;
}

const variantOptions = [
  { value: 'default', label: 'Default', description: 'Progress bar style' },
  { value: 'numbers', label: 'Numbers', description: 'Numbered circles' },
  { value: 'dots', label: 'Dots', description: 'Simple dot indicators' },
];

const stepCountOptions = [
  { value: '3', label: '3 steps', description: 'Simple flow' },
  { value: '4', label: '4 steps', description: 'Standard flow' },
  { value: '5', label: '5 steps', description: 'Complex flow' },
  { value: '6', label: '6 steps', description: 'Multi-step process' },
];

export function StepperStory() {
  const { controls, updateControl } = useStoryControls<StepperControls>({
    variant: 'default',
    currentStep: 1,
    stepCount: 4,
  });

  const [interactiveStep, setInteractiveStep] = useState(0);

  // Generate step labels based on step count
  const generateSteps = (count: number) => {
    const baseSteps = [
      'Account Setup',
      'Personal Info',
      'Preferences',
      'Review',
      'Payment',
      'Confirmation',
    ];
    return baseSteps.slice(0, count);
  };

  const steps = generateSteps(controls.stepCount);

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        steps: JSON.stringify(steps),
        currentStep: controls.currentStep,
        variant: controls.variant,
      },
      {
        steps: undefined,
        currentStep: 0,
        variant: 'default',
      },
    );

    return `<Stepper${propsString} />`;
  };

  const renderPreview = () => (
    <div className="w-full space-y-4">
      <Stepper
        steps={steps}
        currentStep={controls.currentStep}
        variant={controls.variant}
      />

      {controls.variant === 'numbers' && (
        <div className="text-muted-foreground text-center text-sm">
          Step {controls.currentStep + 1} of {steps.length}:{' '}
          {steps[controls.currentStep]}
        </div>
      )}
    </div>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="variant">Variant</Label>
        <SimpleStorySelect
          value={controls.variant}
          onValueChange={(value) => updateControl('variant', value as any)}
          options={variantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stepCount">Step Count</Label>
        <SimpleStorySelect
          value={controls.stepCount.toString()}
          onValueChange={(value) => {
            const count = parseInt(value);
            updateControl('stepCount', count);
            // Reset current step if it's beyond the new count
            if (controls.currentStep >= count) {
              updateControl('currentStep', count - 1);
            }
          }}
          options={stepCountOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentStep">Current Step</Label>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: controls.stepCount }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant={controls.currentStep === i ? 'default' : 'outline'}
              onClick={() => updateControl('currentStep', i)}
              className="h-8 w-8 p-0"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stepper Variants</CardTitle>
          <CardDescription>
            Different visual styles for step indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Default Progress Bar</h4>
            <Stepper
              steps={['Setup', 'Configuration', 'Review', 'Complete']}
              currentStep={1}
              variant="default"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Numbered Steps</h4>
            <Stepper
              steps={['Setup', 'Configuration', 'Review', 'Complete']}
              currentStep={1}
              variant="numbers"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Dot Indicators</h4>
            <Stepper
              steps={['Setup', 'Configuration', 'Review', 'Complete']}
              currentStep={1}
              variant="dots"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Stepper</CardTitle>
          <CardDescription>
            Navigate through steps with controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Stepper
            steps={['Account', 'Profile', 'Settings', 'Review', 'Done']}
            currentStep={interactiveStep}
            variant="numbers"
          />

          <div className="space-y-2 text-center">
            <div className="text-muted-foreground text-sm">
              Step {interactiveStep + 1} of 5:{' '}
              {
                ['Account', 'Profile', 'Settings', 'Review', 'Done'][
                  interactiveStep
                ]
              }
            </div>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setInteractiveStep(Math.max(0, interactiveStep - 1))
                }
                disabled={interactiveStep === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setInteractiveStep(Math.min(4, interactiveStep + 1))
                }
                disabled={interactiveStep === 4}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Different Step Counts</CardTitle>
          <CardDescription>
            Steppers with various numbers of steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">3-Step Process</h4>
            <Stepper
              steps={['Start', 'Configure', 'Finish']}
              currentStep={2}
              variant="numbers"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">6-Step Process</h4>
            <Stepper
              steps={[
                'Account',
                'Profile',
                'Preferences',
                'Payment',
                'Review',
                'Complete',
              ]}
              currentStep={3}
              variant="dots"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>Stepper Component</CardTitle>
        <CardDescription>
          Complete API reference for Stepper component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">Stepper</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A step indicator component for multi-step processes with various
              visual styles.
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
                    <td className="p-3 font-mono text-sm">steps</td>
                    <td className="p-3 font-mono text-sm">string[]</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Array of step labels</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">currentStep</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">0</td>
                    <td className="p-3">Index of currently active step</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">variant</td>
                    <td className="p-3 font-mono text-sm">
                      'default' | 'numbers' | 'dots'
                    </td>
                    <td className="p-3 font-mono text-sm">'default'</td>
                    <td className="p-3">Visual style variant</td>
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
          <CardTitle>When to Use Stepper</CardTitle>
          <CardDescription>Best practices for step indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use Stepper For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Multi-step forms and wizards</li>
              <li>• Onboarding processes</li>
              <li>• Setup and configuration flows</li>
              <li>• Checkout and registration processes</li>
              <li>• Sequential task completion</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Don't Use Stepper For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Single-page forms</li>
              <li>• Non-sequential processes</li>
              <li>• Navigation between unrelated sections</li>
              <li>• File upload progress (use progress bar)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choosing the Right Variant</CardTitle>
          <CardDescription>Guidelines for stepper variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Default (Progress Bar)</h4>
            <p className="text-muted-foreground text-sm">
              Best for linear progress indication with clear visual completion.
              Good for forms and simple workflows.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Numbers</h4>
            <p className="text-muted-foreground text-sm">
              Ideal for complex multi-step processes where step labels are
              important. Shows clear progression and allows easy reference to
              specific steps.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Dots</h4>
            <p className="text-muted-foreground text-sm">
              Perfect for compact spaces and when step sequence is more
              important than labels. Great for onboarding screens and quick
              setup flows.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UX Best Practices</CardTitle>
          <CardDescription>Creating effective step experiences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Clear Labels</h4>
            <p className="text-muted-foreground text-sm">
              Use concise, descriptive labels that clearly indicate what each
              step contains.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Optimal Step Count</h4>
            <p className="text-muted-foreground text-sm">
              Keep steps between 3-7 for optimal user comprehension. Break down
              complex flows.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Progress Indication</h4>
            <p className="text-muted-foreground text-sm">
              Show completion status and allow users to understand their
              position in the flow.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Navigation Support</h4>
            <p className="text-muted-foreground text-sm">
              Consider allowing backward navigation to previously completed
              steps.
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
