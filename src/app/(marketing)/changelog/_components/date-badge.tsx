import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DateBadgeProps {
  date: string;
}

export function DateBadge({ date }: DateBadgeProps) {
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');

  return (
    <div className="text-muted-foreground flex flex-shrink-0 items-center gap-2 text-sm">
      <CalendarIcon className="size-3" />
      <span>{formattedDate}</span>
    </div>
  );
}
