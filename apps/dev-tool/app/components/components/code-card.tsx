'use client';

import { Check, Copy } from 'lucide-react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';

import { useCopyCode } from '../lib/story-utils';

interface CodeCardProps {
  title?: string;
  description?: string;
  code: string;
  language?: 'tsx' | 'jsx' | 'javascript' | 'typescript';
  className?: string;
}

export function CodeCard({
  title = 'Generated Code',
  description = 'Copy and paste this code into your project',
  code,
  language = 'tsx',
  className,
}: CodeCardProps) {
  const { copiedCode, copyCode } = useCopyCode();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <Button onClick={() => copyCode(code)} size="sm" variant="outline">
            {copiedCode ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}

            {copiedCode ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
