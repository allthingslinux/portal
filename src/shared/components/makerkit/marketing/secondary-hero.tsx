import { cn } from "~/components/lib/utils";
import { Heading } from "~/components/ui/heading";

interface SecondaryHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  pill?: React.ReactNode;
  heading: React.ReactNode;
  subheading: React.ReactNode;
}

export const SecondaryHero: React.FC<SecondaryHeroProps> =
  function SecondaryHeroComponent({
    className,
    pill,
    heading,
    subheading,
    children,
    ...props
  }) {
    return (
      <div
        className={cn(
          "flex flex-col items-center space-y-4 text-center",
          className
        )}
        {...props}
      >
        {pill}

        <div className="flex flex-col">
          <Heading className="tracking-tighter" level={2}>
            {heading}
          </Heading>

          <h3 className="text-center font-medium font-sans text-secondary-foreground/70 text-xl tracking-tight">
            {subheading}
          </h3>
        </div>

        {children}
      </div>
    );
  };
