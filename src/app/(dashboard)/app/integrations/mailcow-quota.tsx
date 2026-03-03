"use client";

import { HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getMailboxUsage } from "@/features/integrations/lib/mailcow/actions";
import { formatBytes } from "@/shared/utils/format";
import { cn } from "@/shared/utils/index";

interface MailboxQuotaProps {
  accountId: string;
}

export function MailboxQuota({ accountId }: MailboxQuotaProps) {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["mailcow", "quota", accountId],
    queryFn: async () => {
      const data = await getMailboxUsage(accountId);
      if (data && typeof data === "object") {
        return {
          quota: Number(data.quota) || 0,
          quota_used: Number(data.quota_used) || 0,
          messages: Number(data.messages) || 0,
        };
      }
      return null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex animate-pulse items-center gap-2 text-muted-foreground text-sm">
        <HardDrive className="h-4 w-4 animate-spin" />
        <span className="text-xs">Loading storage...</span>
      </div>
    );
  }

  if (!usage || usage.quota <= 0) {
    return null;
  }

  const percentage = Math.min(
    Math.round((usage.quota_used / usage.quota) * 100),
    100
  );

  let indicatorColor = "bg-primary";
  let textColor = "text-muted-foreground";

  if (percentage > 95) {
    indicatorColor = "bg-destructive";
    textColor = "text-destructive font-bold";
  } else if (percentage > 80) {
    indicatorColor = "bg-yellow-500";
    textColor = "text-yellow-600 dark:text-yellow-400";
  }

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium">
          <HardDrive className="h-3.5 w-3.5" />
          <span>Mailbox Storage</span>
        </div>
        <span className={textColor}>{percentage}% full</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500", indicatorColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>{formatBytes(usage.quota_used)} used</span>
        <span>{formatBytes(usage.quota)} total</span>
      </div>
    </div>
  );
}
