'use client';

import { useMemo } from 'react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@portal/ui/field';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { RadioGroup, RadioGroupItem } from '@portal/ui/radio-group';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

import {
  formatCodeBlock,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface FieldControls {
  orientation: 'vertical' | 'horizontal';
  showDescriptions: boolean;
  showErrors: boolean;
  useLegend: boolean;
  includeSeparator: boolean;
}

const orientationOptions = [
  {
    value: 'vertical',
    label: 'Vertical',
    description: 'Label and controls stacked',
  },
  {
    value: 'horizontal',
    label: 'Horizontal',
    description: 'Label inline with controls',
  },
] as const;

export function FieldStory() {
  const { controls, updateControl } = useStoryControls<FieldControls>({
    orientation: 'horizontal',
    showDescriptions: true,
    showErrors: false,
    useLegend: true,
    includeSeparator: true,
  });

  const fieldPropsString = useMemo(
    () =>
      generatePropsString(
        {
          orientation: controls.orientation,
        },
        { orientation: 'vertical' },
      ),
    [controls.orientation],
  );

  const generatedCode = useMemo(() => {
    const separatorLine = controls.includeSeparator
      ? '\n    <FieldSeparator className="mt-4">Preferences</FieldSeparator>'
      : '';

    const descriptionLine = controls.showDescriptions
      ? '\n        <FieldDescription>The name that will appear on invoices.</FieldDescription>'
      : '';

    const errorLine = controls.showErrors
      ? '\n        <FieldError errors={[{ message: "Please provide your full name." }]} />'
      : '';

    const code = `<FieldSet className="mx-auto w-full max-w-3xl space-y-8">
  ${controls.useLegend ? '<FieldLegend className="text-base font-semibold">Account Details</FieldLegend>\n  ' : ''}<FieldGroup className="space-y-6">
    <Field orientation="horizontal" data-invalid={${controls.showErrors}} className="items-start gap-4 sm:gap-6">
      <FieldLabel htmlFor="full-name" className="text-sm font-medium sm:w-48">Full name</FieldLabel>
      <FieldContent className="flex w-full max-w-xl flex-col gap-2">
        <Input id="full-name" placeholder="Ada Lovelace" aria-invalid={${controls.showErrors}} />${descriptionLine}${errorLine}
      </FieldContent>
    </Field>${separatorLine}
    <Field orientation="horizontal" className="items-start gap-4 sm:gap-6">
      <FieldLabel htmlFor="email" className="text-sm font-medium sm:w-48">Email address</FieldLabel>
      <FieldContent className="flex w-full max-w-xl flex-col gap-2">
        <Input id="email" type="email" placeholder="ada@lovelace.dev" />${
          controls.showDescriptions
            ? '\n        <FieldDescription>Used for sign-in and notifications.</FieldDescription>'
            : ''
        }
      </FieldContent>
    </Field>
    <Field orientation="horizontal" className="items-start gap-4 sm:gap-6">
      <FieldLabel htmlFor="bio" className="text-sm font-medium sm:w-48">Bio</FieldLabel>
      <FieldContent className="flex w-full max-w-xl flex-col gap-2">
        <Textarea id="bio" rows={4} placeholder="Tell us about your work." />${
          controls.showDescriptions
            ? '\n        <FieldDescription>Supports Markdown formatting.</FieldDescription>'
            : ''
        }
      </FieldContent>
    </Field>
    <Field orientation="horizontal" className="items-start gap-4 sm:gap-6">
      <FieldLabel className="text-sm font-medium sm:w-48">
        <FieldTitle>Notifications</FieldTitle>
      </FieldLabel>
      <FieldContent className="flex w-full max-w-xl flex-col gap-2">
        <Switch id="notifications" defaultChecked />\n        ${
          controls.showDescriptions
            ? '\n        <FieldDescription>Receive updates about comments and mentions.</FieldDescription>'
            : ''
        }
      </FieldContent>
    </Field>
    <Field orientation="horizontal" className="items-start gap-4 sm:gap-6">
      <FieldLabel className="text-sm font-medium sm:w-48">
        <FieldTitle>Preferred contact</FieldTitle>
      </FieldLabel>
      <FieldContent className="flex w-full max-w-xl flex-col gap-3">
        <RadioGroup defaultValue="email" className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="email" id="contact-email" />
            <Label htmlFor="contact-email">Email</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sms" id="contact-sms" />
            <Label htmlFor="contact-sms">SMS</Label>
          </div>
        </RadioGroup>${
          controls.showDescriptions
            ? '\n        <FieldDescription>Select how we should reach out for account activity.</FieldDescription>'
            : ''
        }
      </FieldContent>
    </Field>
  </FieldGroup>
</FieldSet>`;

    return formatCodeBlock(code, [
      "import { Button } from '@portal/ui/button';",
      `import { 
  Field, 
  FieldContent, 
  FieldDescription, 
  FieldError, 
  FieldGroup, 
  FieldLabel, 
  FieldLegend, 
  FieldSeparator, 
  FieldSet, 
  FieldTitle 
} from '@portal/ui/field';`,
      "import { Input } from '@portal/ui/input';",
      "import { Label } from '@portal/ui/label';",
      "import { RadioGroup, RadioGroupItem } from '@portal/ui/radio-group';",
      "import { Switch } from '@portal/ui/switch';",
      "import { Textarea } from '@portal/ui/textarea';",
    ]);
  }, [
    controls.includeSeparator,
    controls.orientation,
    controls.showDescriptions,
    controls.showErrors,
    controls.useLegend,
    fieldPropsString,
  ]);

  const preview = (
    <Card>
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
        <CardDescription>
          Organize related form controls with consistent spacing and error
          handling.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldSet className="mx-auto max-w-3xl space-y-8">
          {controls.useLegend && (
            <FieldLegend className="text-base font-semibold">
              Account details
            </FieldLegend>
          )}

          <FieldGroup className="space-y-6">
            <Field
              orientation={controls.orientation}
              data-invalid={controls.showErrors || undefined}
              className="items-start"
            >
              <FieldLabel
                htmlFor="story-full-name"
                className="text-sm font-medium sm:w-48"
              >
                Full name
              </FieldLabel>

              <FieldContent className="space-y-2 sm:max-w-xl">
                <Input
                  id="story-full-name"
                  placeholder="Ada Lovelace"
                  aria-invalid={controls.showErrors}
                />

                {controls.showDescriptions && (
                  <FieldDescription>
                    The name that will appear on invoices.
                  </FieldDescription>
                )}

                {controls.showErrors && (
                  <FieldError
                    errors={[{ message: 'Please provide your full name.' }]}
                  />
                )}
              </FieldContent>
            </Field>

            {controls.includeSeparator && (
              <FieldSeparator className="mt-4">Preferences</FieldSeparator>
            )}

            <Field orientation={controls.orientation} className="items-start">
              <FieldLabel
                htmlFor="story-email"
                className="text-sm font-medium sm:w-48"
              >
                Email address
              </FieldLabel>

              <FieldContent className="space-y-2 sm:max-w-xl">
                <Input
                  id="story-email"
                  type="email"
                  placeholder="ada@lovelace.dev"
                />

                {controls.showDescriptions && (
                  <FieldDescription>
                    Used for sign-in and important notifications.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>

            <Field orientation={controls.orientation} className="items-start">
              <FieldLabel
                htmlFor="story-bio"
                className="text-sm font-medium sm:w-48"
              >
                Bio
              </FieldLabel>

              <FieldContent className="space-y-2 sm:max-w-xl">
                <Textarea
                  id="story-bio"
                  rows={4}
                  placeholder="Tell us about your work."
                />

                {controls.showDescriptions && (
                  <FieldDescription>
                    Share a short summary. Markdown is supported.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>

            <Field orientation={controls.orientation} className="items-start">
              <FieldLabel className="text-sm font-medium sm:w-48">
                <FieldTitle>Notifications</FieldTitle>
              </FieldLabel>

              <FieldContent className="space-y-2 sm:max-w-xl">
                <Switch id="story-notifications" defaultChecked />

                {controls.showDescriptions && (
                  <FieldDescription>
                    Receive updates about comments, mentions, and reminders.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>

            <Field orientation={controls.orientation} className="items-start">
              <FieldLabel className="text-sm font-medium sm:w-48">
                <FieldTitle>Preferred contact</FieldTitle>
              </FieldLabel>

              <FieldContent className="space-y-3 sm:max-w-xl">
                <RadioGroup
                  defaultValue="email"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="story-contact-email"
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <RadioGroupItem value="email" id="story-contact-email" />
                    Email
                  </Label>

                  <Label
                    htmlFor="story-contact-sms"
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <RadioGroupItem value="sms" id="story-contact-sms" />
                    SMS
                  </Label>
                </RadioGroup>

                {controls.showDescriptions && (
                  <FieldDescription>
                    We will use this channel for account and security updates.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  );

  const controlsPanel = (
    <>
      <div className="space-y-2">
        <Label htmlFor="field-orientation">Orientation</Label>
        <SimpleStorySelect
          value={controls.orientation}
          onValueChange={(value) => updateControl('orientation', value)}
          options={orientationOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="legend-toggle" className="text-sm font-medium">
          Show legend
        </Label>
        <Switch
          id="legend-toggle"
          checked={controls.useLegend}
          onCheckedChange={(checked) => updateControl('useLegend', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="descriptions-toggle" className="text-sm font-medium">
          Show descriptions
        </Label>
        <Switch
          id="descriptions-toggle"
          checked={controls.showDescriptions}
          onCheckedChange={(checked) =>
            updateControl('showDescriptions', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="errors-toggle" className="text-sm font-medium">
          Show validation errors
        </Label>
        <Switch
          id="errors-toggle"
          checked={controls.showErrors}
          onCheckedChange={(checked) => updateControl('showErrors', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="separator-toggle" className="text-sm font-medium">
          Include separator
        </Label>
        <Switch
          id="separator-toggle"
          checked={controls.includeSeparator}
          onCheckedChange={(checked) =>
            updateControl('includeSeparator', checked)
          }
        />
      </div>
    </>
  );

  const examples = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Inline layout</CardTitle>
          <CardDescription>
            Use the horizontal orientation when labels and inputs share a row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="inline-name">Full name</FieldLabel>
            <FieldContent>
              <Input id="inline-name" placeholder="Grace Hopper" />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stacked layout</CardTitle>
          <CardDescription>
            Vertical orientation keeps dense forms readable on small screens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field orientation="vertical">
            <FieldLabel htmlFor="stacked-bio">Bio</FieldLabel>
            <FieldContent>
              <Textarea id="stacked-bio" rows={3} />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={preview}
      controls={controlsPanel}
      generatedCode={generatedCode}
      examples={examples}
      previewTitle="Field primitives"
      previewDescription="Compose accessible field layouts with consistent spacing, descriptions, and error messaging."
      controlsTitle="Configuration"
      controlsDescription="Switch between orientations and auxiliary helpers to match your form design."
      codeTitle="Usage"
      codeDescription="Combine the primitives to build structured forms."
    />
  );
}

export default FieldStory;
