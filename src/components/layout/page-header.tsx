// ============================================================================
// Page Header Component
// ============================================================================
// Standardized page header component for consistent styling across dashboard pages.
// Provides a consistent header with title and description.

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="font-semibold text-2xl">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
