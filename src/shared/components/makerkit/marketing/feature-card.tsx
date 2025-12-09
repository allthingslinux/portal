import type React from "react";

import { cn } from "~/components/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  className,
  label,
  description,
  ...props
}) => (
  <div className={cn("rounded bg-muted/50", className)} {...props}>
    <CardHeader className="p-4">
      <CardTitle className="font-medium text-lg">{label}</CardTitle>

      <CardDescription className="max-w-xs font-normal text-muted-foreground text-sm">
        {description}
      </CardDescription>
    </CardHeader>
  </div>
);
