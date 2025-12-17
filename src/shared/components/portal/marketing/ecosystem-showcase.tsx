import type React from "react";

import { cn } from "~/components/lib/utils";

interface EcosystemShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: React.ReactNode;
  description?: React.ReactNode;
  textPosition?: "left" | "right";
}

export const EcosystemShowcase: React.FC<EcosystemShowcaseProps> =
  function EcosystemShowcaseComponent({
    className,
    heading,
    description,
    textPosition = "left",
    children,
    ...props
  }) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col space-y-8 rounded-md bg-muted/50 p-6 lg:space-x-16 lg:space-y-0",
          className,
          {
            "lg:flex-row": textPosition === "left",
            "lg:flex-row-reverse": textPosition === "right",
          }
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-col items-start gap-y-4 text-left lg:w-1/3",
            {
              "text-right": textPosition === "right",
            }
          )}
        >
          <h2 className="font-normal text-3xl text-secondary-foreground tracking-tight">
            {heading}
          </h2>

          {description && (
            <p className="mt-2 text-base text-muted-foreground lg:text-lg">
              {description}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex w-full lg:w-2/3",
            textPosition === "right" && "m-0 text-right"
          )}
        >
          {children}
        </div>
      </div>
    );
  };
