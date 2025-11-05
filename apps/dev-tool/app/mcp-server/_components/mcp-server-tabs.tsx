'use client';

import { DatabaseIcon, FileTextIcon } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';

interface McpServerTabsProps {
  prdManagerContent: React.ReactNode;
  databaseToolsContent?: React.ReactNode;
}

export function McpServerTabs({
  prdManagerContent,
  databaseToolsContent,
}: McpServerTabsProps) {
  return (
    <div className="h-full">
      <Tabs defaultValue="database-tools" className="flex h-full flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="database-tools"
            className="flex items-center gap-2"
          >
            <DatabaseIcon className="h-4 w-4" />
            Database Tools
          </TabsTrigger>
          <TabsTrigger value="prd-manager" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            PRD Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database-tools" className="flex-1 space-y-4">
          {databaseToolsContent || (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <DatabaseIcon className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Database Tools</h3>
                <p className="text-muted-foreground">
                  Explore database schemas, tables, functions, and enums
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prd-manager" className="flex-1 space-y-4">
          {prdManagerContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
