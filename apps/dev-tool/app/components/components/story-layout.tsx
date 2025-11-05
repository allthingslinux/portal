'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';

import { CodeCard } from './code-card';
import { ControlPanel } from './control-panel';
import { PreviewCard } from './preview-card';

export interface StoryTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ComponentStoryLayoutProps {
  // Playground tab props
  preview: React.ReactNode;
  controls?: React.ReactNode;
  generatedCode?: string;

  // Additional tabs
  examples?: React.ReactNode;
  apiReference?: React.ReactNode;
  usageGuidelines?: React.ReactNode;

  // Layout customization
  defaultTab?: string;
  className?: string;
  previewClassName?: string;
  controlsClassName?: string;

  // Card titles
  previewTitle?: string;
  previewDescription?: string;
  controlsTitle?: string;
  controlsDescription?: string;
  codeTitle?: string;
  codeDescription?: string;
}

export function ComponentStoryLayout({
  // Playground content
  preview,
  controls,
  generatedCode,

  // Tab content
  examples,
  apiReference,
  usageGuidelines,

  // Customization
  defaultTab = 'playground',
  className = '',
  previewClassName,
  controlsClassName,

  // Card titles
  previewTitle,
  previewDescription,
  controlsTitle,
  controlsDescription,
  codeTitle,
  codeDescription,
}: ComponentStoryLayoutProps) {
  return (
    <div className={className}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          {examples && <TabsTrigger value="examples">Examples</TabsTrigger>}
          {apiReference && <TabsTrigger value="api">API Reference</TabsTrigger>}
          {usageGuidelines && (
            <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
          )}
        </TabsList>

        {/* Playground Tab */}
        <TabsContent value="playground" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Preview */}
            <PreviewCard
              title={previewTitle}
              description={previewDescription}
              className={`lg:col-span-2 ${previewClassName || ''}`}
            >
              {preview}
            </PreviewCard>

            {/* Controls */}
            {controls && (
              <ControlPanel
                title={controlsTitle}
                description={controlsDescription}
                className={controlsClassName}
              >
                {controls}
              </ControlPanel>
            )}
          </div>

          {/* Generated Code */}
          {generatedCode && (
            <CodeCard
              title={codeTitle}
              description={codeDescription}
              code={generatedCode}
            />
          )}
        </TabsContent>

        {/* Examples Tab */}
        {examples && (
          <TabsContent value="examples" className="space-y-6">
            {examples}
          </TabsContent>
        )}

        {/* API Reference Tab */}
        {apiReference && (
          <TabsContent value="api" className="space-y-6">
            {apiReference}
          </TabsContent>
        )}

        {/* Usage Guidelines Tab */}
        {usageGuidelines && (
          <TabsContent value="usage" className="space-y-6">
            {usageGuidelines}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
