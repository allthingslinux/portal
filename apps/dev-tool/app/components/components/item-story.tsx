'use client';

import { useMemo } from 'react';

import { ArrowUpRight, Calendar, CheckCircle2, Clock3 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@portal/ui/avatar';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@portal/ui/item';
import { Label } from '@portal/ui/label';
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

interface ItemControls {
  variant: 'default' | 'outline' | 'muted';
  size: 'default' | 'sm';
  showMedia: boolean;
  showDescription: boolean;
  showActions: boolean;
  showFooter: boolean;
  showSeparator: boolean;
}

const variantOptions = [
  { value: 'default', label: 'Default', description: 'Unstyled surface' },
  { value: 'outline', label: 'Outline', description: 'Bordered list item' },
  { value: 'muted', label: 'Muted', description: 'Soft background highlight' },
] as const;

const sizeOptions = [
  { value: 'default', label: 'Default', description: 'Spacious item' },
  { value: 'sm', label: 'Small', description: 'Compact height' },
] as const;

export function ItemStory() {
  const { controls, updateControl } = useStoryControls<ItemControls>({
    variant: 'default',
    size: 'default',
    showMedia: true,
    showDescription: true,
    showActions: true,
    showFooter: true,
    showSeparator: true,
  });

  const itemPropsString = useMemo(
    () =>
      generatePropsString(
        {
          variant: controls.variant,
          size: controls.size,
        },
        {
          variant: 'default',
          size: 'default',
        },
      ),
    [controls.variant, controls.size],
  );

  const generatedCode = useMemo(() => {
    const lines: string[] = [];
    lines.push(`<Item${itemPropsString}>`);

    if (controls.showMedia) {
      lines.push(
        '  <ItemMedia variant="icon">',
        '    <Calendar className="h-4 w-4" />',
        '  </ItemMedia>',
      );
    }

    lines.push('  <ItemContent>');
    lines.push('    <ItemHeader>');
    lines.push('      <ItemTitle>Weekly planning</ItemTitle>');

    if (controls.showActions) {
      lines.push(
        '      <ItemActions>',
        '        <Badge variant="secondary">12 tasks</Badge>',
        '        <Button variant="ghost" size="sm" className="gap-1">',
        '          View',
        '          <ArrowUpRight className="h-4 w-4" />',
        '        </Button>',
        '      </ItemActions>',
      );
    }

    lines.push('    </ItemHeader>');

    if (controls.showDescription) {
      lines.push(
        '    <ItemDescription>Plan upcoming sprints and capture blockers from the team sync.</ItemDescription>',
      );
    }

    if (controls.showFooter) {
      lines.push(
        '    <ItemFooter>',
        '      <div className="flex items-center gap-2 text-xs text-muted-foreground">',
        '        <Clock3 className="h-3.5 w-3.5" />',
        '        Updated 2 hours ago',
        '      </div>',
        '      <Badge variant="outline">In progress</Badge>',
        '    </ItemFooter>',
      );
    }

    lines.push('  </ItemContent>');
    lines.push('</Item>');

    return formatCodeBlock(lines.join('\n'), [
      "import { ArrowUpRight, Calendar, Clock3 } from 'lucide-react';",
      "import { Badge } from '@portal/ui/badge';",
      "import { Button } from '@portal/ui/button';",
      "import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from '@portal/ui/item';",
    ]);
  }, [controls, itemPropsString]);

  const preview = (
    <ItemGroup className="gap-3">
      <Item
        variant={controls.variant}
        size={controls.size}
        className={cn('w-full')}
      >
        {controls.showMedia && (
          <ItemMedia variant="icon">
            <Calendar className="h-4 w-4" />
          </ItemMedia>
        )}

        <ItemContent>
          <ItemHeader>
            <ItemTitle className="gap-2">
              Weekly planning
              <Badge variant="secondary">Sprint</Badge>
            </ItemTitle>

            {controls.showActions && (
              <ItemActions className="gap-2">
                <Badge variant="outline">12 tasks</Badge>
                <Button variant="ghost" size="sm" className="gap-1">
                  View
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </ItemActions>
            )}
          </ItemHeader>

          {controls.showDescription && (
            <ItemDescription>
              Plan upcoming sprints and capture blockers from the team sync.
            </ItemDescription>
          )}

          {controls.showFooter && (
            <ItemFooter>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock3 className="h-3.5 w-3.5" />
                Updated 2 hours ago
              </div>

              <Badge variant="outline">In progress</Badge>
            </ItemFooter>
          )}
        </ItemContent>
      </Item>

      {controls.showSeparator && <ItemSeparator />}

      <Item variant="muted" size="sm">
        <ItemMedia>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://daily.jstor.org/wp-content/uploads/2019/10/ada_lovelace_pioneer_1050x700.jpg" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemHeader>
            <ItemTitle className="gap-2">
              Ada Lovelace
              <Badge variant="outline">Owner</Badge>
            </ItemTitle>
            {controls.showActions && (
              <ItemActions className="gap-2">
                <Button size="sm" variant="ghost" className="gap-1">
                  Message
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </ItemActions>
            )}
          </ItemHeader>
          {controls.showDescription && (
            <ItemDescription>
              Building the analytics module. Next milestone due Friday.
            </ItemDescription>
          )}
          {controls.showFooter && (
            <ItemFooter>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </Badge>
              <span className="text-muted-foreground text-xs">Joined 2023</span>
            </ItemFooter>
          )}
        </ItemContent>
      </Item>
    </ItemGroup>
  );

  const controlsPanel = (
    <>
      <div className="space-y-2">
        <Label htmlFor="item-variant">Variant</Label>
        <SimpleStorySelect
          value={controls.variant}
          onValueChange={(value) => updateControl('variant', value)}
          options={variantOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-size">Size</Label>
        <SimpleStorySelect
          value={controls.size}
          onValueChange={(value) => updateControl('size', value)}
          options={sizeOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-media" className="text-sm font-medium">
          Show media
        </Label>
        <Switch
          id="show-media"
          checked={controls.showMedia}
          onCheckedChange={(checked) => updateControl('showMedia', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-description" className="text-sm font-medium">
          Show description
        </Label>
        <Switch
          id="show-description"
          checked={controls.showDescription}
          onCheckedChange={(checked) =>
            updateControl('showDescription', checked)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-actions" className="text-sm font-medium">
          Show actions
        </Label>
        <Switch
          id="show-actions"
          checked={controls.showActions}
          onCheckedChange={(checked) => updateControl('showActions', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-footer" className="text-sm font-medium">
          Show footer
        </Label>
        <Switch
          id="show-footer"
          checked={controls.showFooter}
          onCheckedChange={(checked) => updateControl('showFooter', checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-separator" className="text-sm font-medium">
          Show separator
        </Label>
        <Switch
          id="show-separator"
          checked={controls.showSeparator}
          onCheckedChange={(checked) => updateControl('showSeparator', checked)}
        />
      </div>
    </>
  );

  const examples = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>
            Stack compact items for task summaries or changelog entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ItemGroup className="gap-y-4">
            <Item size="sm" variant="outline">
              <ItemContent>
                <ItemHeader>
                  <ItemTitle className="gap-2">
                    Deployment checklist
                    <Badge variant="secondary">Today</Badge>
                  </ItemTitle>
                </ItemHeader>
                <ItemDescription>
                  Review release notes, QA smoke tests, and notify support.
                </ItemDescription>
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item size="sm" variant="outline">
              <ItemContent>
                <ItemTitle>QA sign-off</ItemTitle>
                <ItemFooter>
                  <Badge variant="outline">Pending</Badge>
                  <span className="text-muted-foreground text-xs">Due 5pm</span>
                </ItemFooter>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            Combine avatar media with actions to build list views.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-3">
            <Item variant="muted" size="sm">
              <ItemMedia>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>GH</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemHeader>
                  <ItemTitle>Grace Hopper</ItemTitle>
                  <ItemActions>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Profile
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </ItemActions>
                </ItemHeader>
                <ItemDescription>Staff engineer · Platform</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
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
      previewTitle="Composable list items"
      previewDescription="Mix media, headers, and actions to create rich list presentations."
      controlsTitle="Configuration"
      controlsDescription="Toggle structural primitives to match your layout requirements."
      codeTitle="Usage"
      codeDescription="Start from a base item and add media, actions, or metadata as needed."
    />
  );
}

export default ItemStory;
