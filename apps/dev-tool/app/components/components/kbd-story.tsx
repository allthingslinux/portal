'use client';

import { useMemo } from 'react';

import { Command, Search } from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Kbd, KbdGroup } from '@portal/ui/kbd';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { Switch } from '@portal/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@portal/ui/tooltip';

import { formatCodeBlock, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

interface KbdControls {
  preset: 'command-k' | 'shift-option-s' | 'control-shift-p' | 'custom';
  showTooltip: boolean;
  customShortcut: string;
}

const presetOptions = [
  {
    value: 'command-k',
    label: 'Command + K',
    description: 'Open global command palette',
  },
  {
    value: 'shift-option-s',
    label: 'Shift + Option + S',
    description: 'Capture screenshot or share',
  },
  {
    value: 'control-shift-p',
    label: 'Ctrl + Shift + P',
    description: 'Trigger quick action menu',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Provide your own keys',
  },
] as const;

function resolveKeys(preset: KbdControls['preset'], custom: string) {
  if (preset === 'custom') {
    return custom
      .split(/\+|\s+/)
      .map((key) => key.trim())
      .filter(Boolean);
  }

  if (preset === 'command-k') {
    return ['⌘', 'K'];
  }

  if (preset === 'shift-option-s') {
    return ['⇧ Shift', '⌥ Option', 'S'];
  }

  return ['Ctrl', 'Shift', 'P'];
}

export function KbdStory() {
  const { controls, updateControl } = useStoryControls<KbdControls>({
    preset: 'command-k',
    showTooltip: true,
    customShortcut: 'Ctrl+Shift+P',
  });

  const keys = useMemo(
    () => resolveKeys(controls.preset, controls.customShortcut),
    [controls.customShortcut, controls.preset],
  );

  const generatedCode = useMemo(() => {
    const groupLines: string[] = [];
    groupLines.push('<KbdGroup>');
    keys.forEach((key) => {
      groupLines.push(`  <Kbd>${key}</Kbd>`);
    });
    groupLines.push('</KbdGroup>');

    let snippet = groupLines.join('\n');

    if (controls.showTooltip) {
      snippet = `<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline">Command palette</Button>\n    </TooltipTrigger>\n    <TooltipContent className="flex items-center gap-2">\n      <span>Press</span>\n      ${groupLines.join('\n      ')}\n    </TooltipContent>\n  </Tooltip>\n</TooltipProvider>`;
    }

    return formatCodeBlock(snippet, [
      "import { Button } from '@portal/ui/button';",
      "import { Kbd, KbdGroup } from '@portal/ui/kbd';",
      "import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@portal/ui/tooltip';",
    ]);
  }, [controls.showTooltip, keys]);

  const preview = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-4">
        {controls.showTooltip ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Command className="h-4 w-4" />
                  Command palette
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2">
                <span>Press</span>
                <KbdGroup>
                  {keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <KbdGroup>
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </KbdGroup>
        )}
      </div>

      <div className="bg-muted/30 rounded-xl border p-6">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">Keyboard shortcut hint</div>
          <div className="text-muted-foreground text-sm">
            Use the keyboard primitives to surface power-user workflows in
            menus, tooltips, or helper text.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SpanShortcut keys={keys} />
          </div>
        </div>
      </div>
    </div>
  );

  const controlsPanel = (
    <>
      <div className="space-y-2">
        <Label htmlFor="preset">Preset</Label>
        <SimpleStorySelect
          value={controls.preset}
          onValueChange={(value) => updateControl('preset', value)}
          options={presetOptions}
        />
      </div>

      {controls.preset === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="custom-shortcut">Custom keys</Label>
          <Input
            id="custom-shortcut"
            value={controls.customShortcut}
            onChange={(event) =>
              updateControl('customShortcut', event.target.value)
            }
            placeholder="Ctrl+Alt+Delete"
          />
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-tooltip" className="text-sm font-medium">
          Show tooltip usage
        </Label>
        <Switch
          id="show-tooltip"
          checked={controls.showTooltip}
          onCheckedChange={(checked) => updateControl('showTooltip', checked)}
        />
      </div>
    </>
  );

  const examples = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Shortcut legend</CardTitle>
          <CardDescription>
            Combine keyboard hints with descriptions for quick reference.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Search workspace</span>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span>Toggle spotlight</span>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Space</Kbd>
            </KbdGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empty state helper</CardTitle>
          <CardDescription>
            Incorporate shortcuts into product education moments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background rounded-md border p-4 text-center">
            <Search className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
            <div className="text-sm font-medium">No results yet</div>
            <div className="text-muted-foreground text-sm">
              Try launching the command palette with
            </div>
            <div className="mt-2 flex justify-center">
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </div>
          </div>
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
      previewTitle="Keyboard input primitives"
      previewDescription="Display keyboard shortcuts inline, in tooltips, or within helper content."
      controlsTitle="Configuration"
      controlsDescription="Select a preset or provide a custom shortcut combination."
      codeTitle="Usage"
      codeDescription="Wrap shortcut keys in the keyboard primitives wherever hints are required."
    />
  );
}

function SpanShortcut({ keys }: { keys: string[] }) {
  return (
    <KbdGroup>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}

export default KbdStory;
