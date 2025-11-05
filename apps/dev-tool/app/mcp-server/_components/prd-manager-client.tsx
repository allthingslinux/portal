'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CalendarIcon, FileTextIcon, PlusIcon, SearchIcon } from 'lucide-react';

import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@portal/ui/dialog';
import { Input } from '@portal/ui/input';
import { Progress } from '@portal/ui/progress';

import type { CreatePRDData } from '../_lib/schemas/create-prd.schema';
import { createPRDAction } from '../_lib/server/prd-server-actions';
import { CreatePRDForm } from './create-prd-form';

interface PRDSummary {
  filename: string;
  title: string;
  lastUpdated: string;
  progress: number;
  totalStories: number;
  completedStories: number;
}

interface PRDManagerClientProps {
  initialPrds: PRDSummary[];
}

export function PRDManagerClient({ initialPrds }: PRDManagerClientProps) {
  const [prds, setPrds] = useState<PRDSummary[]>(initialPrds);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreatePRD = async (data: CreatePRDData) => {
    const result = await createPRDAction(data);

    if (result.success && result.data) {
      const newPRD: PRDSummary = {
        filename: result.data.filename,
        title: result.data.title,
        lastUpdated: result.data.lastUpdated,
        progress: result.data.progress,
        totalStories: result.data.totalStories,
        completedStories: result.data.completedStories,
      };

      setPrds((prev) => [...prev, newPRD]);
      setShowCreateForm(false);

      // Note: In a production app, you might want to trigger a router.refresh()
      // to reload the server component and get the most up-to-date data
    } else {
      // Error handling will be managed by the form component via the action result
      throw new Error(result.error || 'Failed to create PRD');
    }
  };

  const filteredPrds = prds.filter(
    (prd) =>
      prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            placeholder="Search PRDs by title or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create New PRD
        </Button>
      </div>

      {/* PRD List */}
      {filteredPrds.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <FileTextIcon className="text-muted-foreground mx-auto h-8 w-8" />

              <p className="text-muted-foreground mt-2">
                {searchTerm ? 'No PRDs match your search' : 'No PRDs found'}
              </p>

              {!searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2"
                >
                  Create your first PRD
                </Button>
              )}
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

      {/* Create PRD Form Modal */}
      {showCreateForm && (
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl overflow-y-hidden">
            <DialogHeader>
              <DialogTitle>Create New PRD</DialogTitle>
            </DialogHeader>

            <div
              className="overflow-y-auto p-0.5"
              style={{
                maxHeight: '800px',
              }}
            >
              <CreatePRDForm onSubmit={handleCreatePRD} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
