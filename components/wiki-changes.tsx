import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileEdit, FolderTree } from 'lucide-react';

interface WikiChange {
  type: 'edit' | 'new' | 'category';
  title: string;
  user: string;
  timestamp: string;
}

export type { WikiChange };

interface WikiChangesProps {
  changes: WikiChange[];
}

export function WikiChanges({ changes }: WikiChangesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Recent Wiki Changes
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change, i) => (
            <div key={i} className="flex items-start justify-between">
              <div className="flex gap-2">
                {change.type === 'edit' && (
                  <FileEdit className="mt-1 h-4 w-4 text-blue-500" />
                )}
                {change.type === 'new' && (
                  <FileEdit className="mt-1 h-4 w-4 text-green-500" />
                )}
                {change.type === 'category' && (
                  <FolderTree className="mt-1 h-4 w-4 text-yellow-500" />
                )}
                <div className="space-y-1">
                  <p className="text-sm leading-none">{change.title}</p>
                  <p className="text-xs text-muted-foreground">{change.user}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {change.timestamp}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
