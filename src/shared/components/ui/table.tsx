import * as React from 'react';

import { cn } from '../lib/utils';

const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('bg-background relative flex flex-1 flex-col overflow-auto')}
  >
    <table
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
);

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <thead className={cn('[&_tr]:border-b', className)} {...props} />;

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <tfoot
    className={cn(
      'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
);

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => (
  <tr
    className={cn(
      'hover:bg-muted/50 data-[state=selected]:bg-muted group/row border-b transition-colors',
      className,
    )}
    {...props}
  />
);

const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <th
    className={cn(
      'text-muted-foreground h-8 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <td
    className={cn(
      'px-2 py-1.5 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
);

const TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>> = ({
  className,
  ...props
}) => (
  <caption
    className={cn('text-muted-foreground mt-4 text-sm', className)}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
