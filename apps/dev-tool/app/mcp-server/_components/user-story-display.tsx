'use client';

import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  EyeIcon,
  PlayIcon,
  XCircleIcon,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Separator } from '@portal/ui/separator';
import { cn } from '@portal/ui/utils';

interface CustomPhase {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  userStoryIds: string[];
}

interface UserStory {
  id: string;
  title: string;
  userStory: string;
  businessValue: string;
  acceptanceCriteria: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status:
    | 'not_started'
    | 'research'
    | 'in_progress'
    | 'review'
    | 'completed'
    | 'blocked';
  notes?: string;
  estimatedComplexity?: string;
  dependencies?: string[];
  completedAt?: string;
}

interface UserStoryDisplayReadOnlyProps {
  userStories: UserStory[];
  customPhases?: CustomPhase[];
}

const priorityLabels = {
  P0: { label: 'Critical', color: 'destructive' as const },
  P1: { label: 'High', color: 'default' as const },
  P2: { label: 'Medium', color: 'secondary' as const },
  P3: { label: 'Low', color: 'outline' as const },
};

const statusIcons = {
  not_started: CircleIcon,
  research: EyeIcon,
  in_progress: PlayIcon,
  review: ClockIcon,
  completed: CheckCircleIcon,
  blocked: XCircleIcon,
};

const statusLabels = {
  not_started: 'Not Started',
  research: 'Research',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  blocked: 'Blocked',
};

const statusColors = {
  not_started: 'text-muted-foreground',
  research: 'text-blue-600',
  in_progress: 'text-yellow-600',
  review: 'text-purple-600',
  completed: 'text-green-600',
  blocked: 'text-red-600',
};

export function UserStoryDisplay({
  userStories,
}: UserStoryDisplayReadOnlyProps) {
  const renderUserStory = (story: UserStory) => {
    return (
      <Card key={story.id}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-start gap-4 text-sm">
            <span className="line-clamp-2">
              {story.id} - {story.title}
            </span>

            <div className="flex items-center gap-2">
              <Badge className={statusColors[story.status]} variant={'outline'}>
                {statusLabels[story.status]}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {story.businessValue}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {story.acceptanceCriteria.length} criteria
            </span>
          </div>

          {/* Acceptance Criteria */}
          {story.acceptanceCriteria.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-xs font-medium">Acceptance Criteria:</h5>
              <ul className="space-y-1">
                {story.acceptanceCriteria.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-1 text-xs">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground line-clamp-1">
                      {criterion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">User Stories</h3>

        <p className="text-muted-foreground text-sm">
          View user stories and track progress
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {userStories.map(renderUserStory)}
      </div>

      <div>
        <Separator />
      </div>

      <div>
        {userStories.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <div className="text-center">
                <CircleIcon className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-2">
                  No user stories yet
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
