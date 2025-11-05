'use client';

import { useMemo } from 'react';

import { Calendar, Clock, Mail, Search } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@portal/ui/input-group';
import { Kbd, KbdGroup } from '@portal/ui/kbd';
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

import {
  formatCodeBlock,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface InputGroupControls {
  prefixAlign: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
  showPrefix: boolean;
  showSuffix: boolean;
  showKeyboardHint: boolean;
  showPrimaryAction: boolean;
  useTextarea: boolean;
}

const alignmentOptions = [
  {
    value: 'inline-start',
    label: 'Inline Start',
    description: 'Display prefix before the input',
  },
  {
    value: 'inline-end',
    label: 'Inline End',
    description: 'Display prefix after the input',
  },
  {
    value: 'block-start',
    label: 'Block Start',
    description: 'Stack prefix above the control',
  },
  {
    value: 'block-end',
    label: 'Block End',
    description: 'Stack prefix below the control',
  },
] as const;

export function InputGroupStory() {
  const { controls, updateControl } = useStoryControls<InputGroupControls>({
    prefixAlign: 'inline-start',
    showPrefix: true,
    showSuffix: true,
    showKeyboardHint: true,
    showPrimaryAction: true,
    useTextarea: false,
  });

  const inputGroupPropsString = useMemo(() => generatePropsString({}, {}), []);

  const generatedCode = useMemo(() => {
    const lines: string[] = [];
    lines.push(`<InputGroup${inputGroupPropsString}>`);

    if (controls.showPrefix) {
      lines.push(
        `  <InputGroupAddon align="${controls.prefixAlign}">`,
        `    <InputGroupText className="gap-2">`,
        `      <Search className="h-4 w-4" />`,
        `      Search`,
        '    </InputGroupText>',
        '  </InputGroupAddon>',
      );
    }

    if (controls.useTextarea) {
      lines.push(
        '  <InputGroupTextarea rows={3} placeholder="Leave a message" />',
      );
    } else {
      lines.push(
        '  <InputGroupInput type="search" placeholder="Find tasks, docs, people..." />',
      );
    }

    if (controls.showKeyboardHint) {
      lines.push(
        '  <InputGroupAddon align="inline-end">',
        '    <KbdGroup>',
        '      <Kbd>⌘</Kbd>',
        '      <Kbd>K</Kbd>',
        '    </KbdGroup>',
        '  </InputGroupAddon>',
      );
    }

    if (controls.showSuffix) {
      lines.push(
        '  <InputGroupAddon align="inline-end">',
        '    <InputGroupText>',
        '      <Clock className="h-4 w-4" />',
        '      Recent',
        '    </InputGroupText>',
        '  </InputGroupAddon>',
      );
    }

    if (controls.showPrimaryAction) {
      lines.push(
        '  <InputGroupAddon align="inline-end">',
        '    <InputGroupButton size="sm">Search</InputGroupButton>',
        '  </InputGroupAddon>',
      );
    }

    lines.push('</InputGroup>');

    return formatCodeBlock(lines.join('\n'), [
      "import { Calendar, Clock, Mail, Search } from 'lucide-react';",
      `import { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupButton, 
  InputGroupInput, 
  InputGroupText, 
  InputGroupTextarea 
} from '@portal/ui/input-group';`,
      "import { Kbd, KbdGroup } from '@portal/ui/kbd';",
      "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@portal/ui/select';",
    ]);
  }, [controls, inputGroupPropsString]);

  const preview = (
    <div className="flex flex-col gap-6">
      <InputGroup>
        {controls.showPrefix && (
          <InputGroupAddon align={controls.prefixAlign}>
            <InputGroupText className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </InputGroupText>
          </InputGroupAddon>
        )}

        {controls.useTextarea ? (
          <InputGroupTextarea rows={3} placeholder="Leave a message" />
        ) : (
          <InputGroupInput
            type="search"
            placeholder="Find tasks, docs, people..."
          />
        )}

        {controls.showKeyboardHint && (
          <InputGroupAddon align="inline-end">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </InputGroupAddon>
        )}

        {controls.showSuffix && (
          <InputGroupAddon align="inline-end">
            <InputGroupText className="gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </InputGroupText>
          </InputGroupAddon>
        )}

        {controls.showPrimaryAction && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm">Search</InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText className="gap-2">
            <Mail className="h-4 w-4" />
            Invite
          </InputGroupText>
        </InputGroupAddon>

        <InputGroupInput type="email" placeholder="Enter teammate email" />

        <InputGroupAddon align="inline-end">
          <Select defaultValue="editor">
            <SelectTrigger
              data-slot="input-group-control"
              className="hover:bg-muted h-8 border-transparent shadow-none"
            >
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </InputGroupAddon>

        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm">Send invite</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText className="gap-2">
            <Calendar className="h-4 w-4" />
            Availability window
          </InputGroupText>
        </InputGroupAddon>

        <InputGroupTextarea
          placeholder="Share a short update for the team."
          rows={3}
        />
      </InputGroup>
    </div>
  );

  const controlsPanel = (
    <>
      <div className="space-y-2">
        <Label htmlFor="prefix-align">Prefix alignment</Label>
        <SimpleStorySelect
          value={controls.prefixAlign}
          onValueChange={(value) => updateControl('prefixAlign', value)}
          options={alignmentOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="showPrefix" className="text-sm font-medium">
          Show prefix
        </Label>
        <Switch
          id="showPrefix"
          checked={controls.showPrefix}
          onCheckedChange={(checked) => updateControl('showPrefix', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="showSuffix" className="text-sm font-medium">
          Show suffix label
        </Label>
        <Switch
          id="showSuffix"
          checked={controls.showSuffix}
          onCheckedChange={(checked) => updateControl('showSuffix', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="showShortcut" className="text-sm font-medium">
          Show keyboard hint
        </Label>
        <Switch
          id="showShortcut"
          checked={controls.showKeyboardHint}
          onCheckedChange={(checked) =>
            updateControl('showKeyboardHint', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="showPrimary" className="text-sm font-medium">
          Show primary action
        </Label>
        <Switch
          id="showPrimary"
          checked={controls.showPrimaryAction}
          onCheckedChange={(checked) =>
            updateControl('showPrimaryAction', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="useTextarea" className="text-sm font-medium">
          Use textarea control
        </Label>
        <Switch
          id="useTextarea"
          checked={controls.useTextarea}
          onCheckedChange={(checked) => updateControl('useTextarea', checked)}
        />
      </div>
    </>
  );

  const examples = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Search with hotkey</CardTitle>
          <CardDescription>
            Combine keyboard shortcuts and actions within the group wrapper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText className="gap-2">
                <Search className="h-4 w-4" />
                Quick search
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Search knowledge base" />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment composer</CardTitle>
          <CardDescription>
            Switch to a textarea while keeping prefixes and suffixes aligned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InputGroup>
            <InputGroupAddon align="block-start">
              <InputGroupText>Comment</InputGroupText>
            </InputGroupAddon>
            <InputGroupTextarea
              rows={3}
              placeholder="Share an update with the team"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="sm">Post</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
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
      previewTitle="Flexible input groups"
      previewDescription="Compose inputs with inline buttons, keyboard hints, and stacked addons."
      controlsTitle="Configuration"
      controlsDescription="Toggle prefixes, suffixes, and alignment options for the group."
      codeTitle="Usage"
      codeDescription="Copy the layout that matches your form control requirements."
    />
  );
}

export default InputGroupStory;
