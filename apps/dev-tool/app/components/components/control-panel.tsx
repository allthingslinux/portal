'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';

interface ControlPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ControlPanel({
  title = 'Controls',
  description = 'Modify props in real-time',
  children,
  className,
}: ControlPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
