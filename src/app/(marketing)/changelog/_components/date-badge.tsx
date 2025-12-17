import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

type DateBadgeProps = {
  date: string;
};

export function DateBadge({ date }: DateBadgeProps) {
  const formattedDate = format(new Date(date), "MMMM d, yyyy");

  return (
    <div className="flex flex-shrink-0 items-center gap-2 text-muted-foreground text-sm">
      <CalendarIcon className="size-3" />
      <span>{formattedDate}</span>
    </div>
  );
}
