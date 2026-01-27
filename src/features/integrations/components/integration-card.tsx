"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface IntegrationCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function IntegrationCard({
  title,
  description,
  children,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="font-semibold text-lg">{title}</div>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
