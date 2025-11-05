import Link from 'next/link';

import { withI18n } from '@/lib/i18n/with-i18n';
import { DatabaseIcon, FileTextIcon, ServerIcon } from 'lucide-react';

import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Page, PageBody, PageHeader } from '@portal/ui/page';

export const metadata = {
  title: 'MCP Server',
  description:
    'MCP Server development interface for database exploration and PRD management',
};

function McpServerPage() {
  return (
    <Page style={'custom'}>
      <div className={'flex h-screen flex-col overflow-hidden'}>
        <PageHeader
          displaySidebarTrigger={false}
          title={'MCP Server'}
          description={
            'Access MCP Server tools for database exploration and PRD management.'
          }
        />

        <PageBody className={'overflow-hidden'}>
          <div className={'flex h-full flex-1 flex-col p-6'}>
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="text-center">
                <ServerIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h2 className="mb-2 text-2xl font-bold">
                  Welcome to MCP Server Tools
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                  Choose from the tools below to explore your database schema or
                  manage your Product Requirements Documents. Use the sidebar
                  navigation for quick access to specific tools.
                </p>
              </div>

              {/* Tool Cards */}
              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <DatabaseIcon className="h-6 w-6" />
                      Database Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Explore database schemas, tables, functions, and enums
                      through an intuitive interface.
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Browse database schemas and their structure</li>
                      <li>• Explore tables with columns and relationships</li>
                      <li>
                        • Discover database functions and their parameters
                      </li>
                      <li>• View enum types and their values</li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/mcp-server/database">
                        Open Database Tools
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileTextIcon className="h-6 w-6" />
                      PRD Manager
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Create and manage Product Requirements Documents with user
                      stories and progress tracking.
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Create and edit PRDs with structured templates</li>
                      <li>• Manage user stories with priority tracking</li>
                      <li>• Track progress and project status</li>
                      <li>• Export PRDs to markdown format</li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link href="/mcp-server/prd">Open PRD Manager</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </PageBody>
      </div>
    </Page>
  );
}

export default withI18n(McpServerPage);
