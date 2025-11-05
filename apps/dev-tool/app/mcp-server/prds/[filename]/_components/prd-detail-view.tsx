'use client';

import { CalendarIcon, FileTextIcon, UsersIcon } from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Progress } from '@portal/ui/progress';
import { Separator } from '@portal/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portal/ui/tabs';

import { UserStoryDisplay } from '../../../_components/user-story-display';
import type { PRDData } from '../../../_lib/server/prd-page.loader';

interface PRDDetailViewProps {
  filename: string;
  prd: PRDData;
}

export function PRDDetailView({ filename, prd }: PRDDetailViewProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-5 w-5" />
            <h1 className="text-2xl font-bold">{prd.introduction.title}</h1>
          </div>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Updated {prd.metadata.lastUpdated}
            </span>
            <span>{filename}</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{prd.progress.overall}%</span>
          </div>
          <Progress value={prd.progress.overall} className="h-3" />
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>
              {prd.progress.completed} of {prd.progress.total} user stories
              completed
            </span>
            <span>{prd.progress.total - prd.progress.completed} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="user-stories">
            User Stories ({prd.userStories.length})
          </TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="text-muted-foreground">
                  {prd.introduction.overview}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">Problem Statement</h4>
                <p className="text-muted-foreground">
                  {prd.problemStatement.problem}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">Market Opportunity</h4>
                <p className="text-muted-foreground">
                  {prd.problemStatement.marketOpportunity}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Target Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prd.problemStatement.targetUsers?.map(
                    (user, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{user}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prd.solutionOverview.keyFeatures?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Solution Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {prd.solutionOverview.description}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prd.solutionOverview.successMetrics?.map((metric, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-stories">
          <UserStoryDisplay userStories={prd.userStories} />
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-1 font-medium">Last Updated</h4>
                  <p className="text-muted-foreground">
                    {prd.metadata.lastUpdated}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Version</h4>
                  <p className="text-muted-foreground">
                    {prd.metadata.version}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Filename</h4>
                  <p className="text-muted-foreground">{filename}</p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Total User Stories</h4>
                  <p className="text-muted-foreground">{prd.progress.total}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">Progress Breakdown</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed Stories:</span>
                    <Badge variant="default">{prd.progress.completed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Stories:</span>
                    <Badge variant="secondary">
                      {prd.progress.total - prd.progress.completed}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Progress:</span>
                    <Badge variant="outline">{prd.progress.overall}%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
