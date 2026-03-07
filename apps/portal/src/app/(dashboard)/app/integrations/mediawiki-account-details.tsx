"use client";

import type { MediaWikiAccount } from "@/features/integrations/lib/mediawiki/types";

interface MediaWikiAccountDetailsProps {
  account: MediaWikiAccount;
}

export function MediaWikiAccountDetails({
  account,
}: MediaWikiAccountDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Username</p>
          <p className="font-mono text-sm">{account.wikiUsername}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Created</p>
          <p className="text-sm">
            {new Date(account.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
