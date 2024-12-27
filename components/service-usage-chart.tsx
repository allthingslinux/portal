'use client';

import { Progress } from '@/components/ui/progress';

interface ServiceUsageProps {
  used: number;
  total: number;
  unit?: string;
}

export function ServiceUsageChart({
  used,
  total,
  unit = 'GB'
}: ServiceUsageProps) {
  const percentage = (used / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Usage</span>
        <span className="font-medium">
          {used}/{total} {unit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
