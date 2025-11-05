'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CalendarIcon, FileTextIcon, SearchIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Progress } from '@portal/ui/progress';

interface PRDSummary {
  filename: string;
  title: string;
  lastUpdated: string;
  progress: number;
  totalStories: number;
  completedStories: number;
}

interface PRDsListInterfaceProps {
  initialPrds: PRDSummary[];
}

export function PRDsListInterface({ initialPrds }: PRDsListInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrds = initialPrds.filter(
    (prd) =>
      prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">
              Product Requirements Documents
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse and view all PRDs in your project
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex w-full flex-col gap-4">
        <div className="relative max-w-md">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search PRDs by title or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* PRD Grid */}
      {filteredPrds.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <FileTextIcon className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                {searchTerm ? 'No PRDs match your search' : 'No PRDs found'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrds.map((prd) => (
            <Link
              key={prd.filename}
              href={`/mcp-server/prds/${prd.filename}`}
              className="block"
            >
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start gap-2 text-sm">
                    <FileTextIcon className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <span className="line-clamp-2">{prd.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {prd.completedStories}/{prd.totalStories} stories
                      </span>
                    </div>
                    <Progress value={prd.progress} className="h-2" />
                    <div className="text-right text-xs font-medium">
                      {prd.progress}%
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Updated {prd.lastUpdated}</span>
                  </div>

                  {/* Filename */}
                  <div className="text-muted-foreground text-xs">
                    {prd.filename}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
