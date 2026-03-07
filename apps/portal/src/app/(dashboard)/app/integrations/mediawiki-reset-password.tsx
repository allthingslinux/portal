"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@portal/ui/ui/button";
import { captureException } from "@sentry/nextjs";

import { useResetIntegrationPassword } from "@/features/integrations/hooks/use-integration";

export function MediaWikiResetPassword({ accountId }: { accountId: string }) {
  const resetMutation = useResetIntegrationPassword("mediawiki");

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync({ id: accountId });
      toast.success("Password reset email sent", {
        description: "Check the email configured on your wiki account.",
      });
    } catch (err) {
      captureException(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to reset wiki password"
      );
    }
  };

  return (
    <Button
      className="w-full"
      disabled={resetMutation.isPending}
      onClick={handleReset}
      size="sm"
      variant="secondary"
    >
      {resetMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <KeyRound className="mr-2 h-3.5 w-3.5" />
          Reset Password
        </>
      )}
    </Button>
  );
}
