'use client';

import { useMemo } from 'react';

import { Filter, Plus, Settings } from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@portal/ui/button-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import { cn } from '@portal/ui/utils';

import {
  formatCodeBlock,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface ButtonGroupControls {
  orientation: 'horizontal' | 'vertical';
  size: 'sm' | 'default' | 'lg';
  withLabel: boolean;
  withSeparator: boolean;
  withFilter: boolean;
  withPrimary: boolean;
  withSelect: boolean;
  fullWidth: boolean;
}

const orientationOptions = [
  {
    value: 'horizontal',
    label: 'Horizontal',
    description: 'Buttons arranged side-by-side',
  },
  {
    value: 'vertical',
    label: 'Vertical',
    description: 'Stack buttons vertically',
  },
] as const;

const sizeOptions = [
  {
    value: 'sm',
    label: 'Small',
    description: 'Compact 36px controls',
  },
  {
    value: 'default',
    label: 'Default',
    description: 'Standard 40px controls',
  },
  {
    value: 'lg',
    label: 'Large',
    description: 'Spacious 44px controls',
  },
] as const;

export function ButtonGroupStory() {
  const { controls, updateControl } = useStoryControls<ButtonGroupControls>({
    orientation: 'horizontal',
    size: 'sm',
    withLabel: false,
    withSeparator: false,
    withFilter: false,
    withPrimary: false,
    withSelect: false,
    fullWidth: false,
  });

  const buttonGroupPropsString = useMemo(
    () =>
      generatePropsString(
        {
          orientation: controls.orientation,
          className: controls.fullWidth ? 'w-full' : undefined,
        },
        {
          orientation: 'horizontal',
          className: undefined,
        },
      ),
    [controls.fullWidth, controls.orientation],
  );

  const generatedCode = useMemo(() => {
    const separatorOrientation =
      controls.orientation === 'vertical' ? 'horizontal' : 'vertical';

    const buttonSizeProp =
      controls.size === 'default' ? '' : ` size="${controls.size}"`;
    const selectTriggerClasses = [
      'w-[140px] justify-between',
      controls.size === 'sm' ? 'h-9 text-sm' : null,
      controls.size === 'lg' ? 'h-11 text-base' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const labelClasses = [
      'min-w-[120px] justify-between',
      controls.size === 'sm' ? 'text-sm' : null,
      controls.size === 'lg' ? 'text-base' : null,
      'gap-2',
    ]
      .filter(Boolean)
      .join(' ');

    let code = `<ButtonGroup${buttonGroupPropsString}>`;

    if (controls.withLabel) {
      code += `\n  <ButtonGroupText className="${labelClasses}">`;
      code += `\n    Views`;
      code += `\n    <Settings className="h-4 w-4" />`;
      code += `\n  </ButtonGroupText>`;
    }

    code += `\n  <Button variant="outline"${buttonSizeProp}>Overview</Button>`;
    code += `\n  <Button variant="outline"${buttonSizeProp}>Activity</Button>`;
    code += `\n  <Button variant="outline"${buttonSizeProp}>Calendar</Button>`;

    if (controls.withSeparator) {
      code += `\n  <ButtonGroupSeparator orientation="${separatorOrientation}" />`;
    }

    if (controls.withFilter) {
      code += `\n  <Button variant="ghost" className="gap-2"${buttonSizeProp}>`;
      code += `\n    <Filter className="h-4 w-4" />`;
      code += `\n    Filters`;
      code += `\n  </Button>`;
    }

    if (controls.withSelect) {
      code += `\n  <Select defaultValue="all">`;
      code += `\n    <SelectTrigger data-slot="select-trigger" className="${selectTriggerClasses}">`;
      code += `\n      <SelectValue placeholder="Segment" />`;
      code += `\n    </SelectTrigger>`;
      code += `\n    <SelectContent>`;
      code += `\n      <SelectItem value="all">All tasks</SelectItem>`;
      code += `\n      <SelectItem value="mine">Assigned to me</SelectItem>`;
      code += `\n      <SelectItem value="review">Needs review</SelectItem>`;
      code += `\n    </SelectContent>`;
      code += `\n  </Select>`;
    }

    if (controls.withPrimary) {
      code += `\n  <Button${buttonSizeProp}>`;
      code += `\n    <Plus className="mr-2 h-4 w-4" />`;
      code += `\n    New view`;
      code += `\n  </Button>`;
    }

    code += `\n</ButtonGroup>`;

    return formatCodeBlock(code, [
      "import { Filter, Plus, Settings } from 'lucide-react';",
      "import { Button } from '@portal/ui/button';",
      "import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@portal/ui/button-group';",
      "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@portal/ui/select';",
    ]);
  }, [buttonGroupPropsString, controls]);

  const separatorOrientation =
    controls.orientation === 'vertical' ? 'horizontal' : 'vertical';

  const preview = (
    <div
      className={cn(
        'bg-background flex min-h-[220px] items-center justify-center rounded-xl border p-6',
        controls.fullWidth && 'items-start',
      )}
    >
      <ButtonGroup
        orientation={controls.orientation}
        className={cn(controls.fullWidth && 'w-full justify-between')}
      >
        {controls.withLabel && (
          <ButtonGroupText
            className={cn(
              'min-w-[120px] justify-between gap-2',
              controls.size === 'sm' && 'text-sm',
              controls.size === 'lg' && 'text-base',
            )}
          >
            <span>Views</span>
            <Settings className="h-4 w-4" />
          </ButtonGroupText>
        )}

        <Button variant="outline" size={controls.size}>
          Overview
        </Button>
        <Button variant="outline" size={controls.size}>
          Activity
        </Button>
        <Button variant="outline" size={controls.size}>
          Calendar
        </Button>

        {controls.withSeparator && (
          <ButtonGroupSeparator orientation={separatorOrientation} />
        )}

        {controls.withFilter && (
          <Button variant="ghost" size={controls.size} className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        )}

        {controls.withPrimary && (
          <Button size={controls.size} className="gap-2">
            <Plus className="h-4 w-4" />
            New view
          </Button>
        )}
      </ButtonGroup>
    </div>
  );

  const controlsPanel = (
    <>
      <div className="space-y-2">
        <Label htmlFor="orientation">Orientation</Label>
        <SimpleStorySelect
          value={controls.orientation}
          onValueChange={(value) => updateControl('orientation', value)}
          options={orientationOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Size</Label>
        <SimpleStorySelect
          value={controls.size}
          onValueChange={(value) => updateControl('size', value)}
          options={sizeOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="withLabel" className="text-sm font-medium">
          Show label
        </Label>
        <Switch
          id="withLabel"
          checked={controls.withLabel}
          onCheckedChange={(checked) => updateControl('withLabel', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="withFilter" className="text-sm font-medium">
          Show filter button
        </Label>
        <Switch
          id="withFilter"
          checked={controls.withFilter}
          onCheckedChange={(checked) => updateControl('withFilter', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="withPrimary" className="text-sm font-medium">
          Show primary action
        </Label>
        <Switch
          id="withPrimary"
          checked={controls.withPrimary}
          onCheckedChange={(checked) => updateControl('withPrimary', checked)}
        />
      </div>
    </>
  );

  const examples = (
    <Card>
      <CardHeader>
        <CardTitle>Button group sizes</CardTitle>
        <CardDescription>
          Mirror the documentation examples with small, default, and large
          buttons.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ButtonGroup>
          <Button variant="outline" size="sm">
            Small
          </Button>
          <Button variant="outline" size="sm">
            Button
          </Button>
          <Button variant="outline" size="sm">
            Group
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button variant="outline">Default</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Group</Button>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button variant="outline" size="lg">
            Large
          </Button>
          <Button variant="outline" size="lg">
            Button
          </Button>
          <Button variant="outline" size="lg">
            Group
          </Button>
          <Button variant="outline" size="lg">
            <Plus className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={preview}
      controls={controlsPanel}
      generatedCode={generatedCode}
      examples={examples}
      previewTitle="Interactive button group"
      previewDescription="Coordinate related actions, filters, and dropdowns in a single control cluster."
      controlsTitle="Configuration"
      controlsDescription="Toggle layout options and auxiliary actions to compose the group."
      codeTitle="Usage"
      codeDescription="Copy the configuration that matches your toolbar requirements."
    />
  );
}

export default ButtonGroupStory;
