"use client";

import { useState } from "react";
import { Key, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createAppPassword,
  deleteAppPassword,
  getAppPasswords,
} from "@/features/integrations/lib/mailcow/actions";
import { formatDate } from "@/shared/utils/date";

interface AppPasswordManagerProps {
  accountId: string;
}

export function AppPasswordManager({ accountId }: AppPasswordManagerProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: passwords = [], isLoading } = useQuery({
    queryKey: ["mailcow", "passwords", accountId],
    queryFn: () => getAppPasswords(accountId),
  });

  const handleCreate = async () => {
    if (!newName) {
      return;
    }
    try {
      setIsCreating(true);
      const result = await createAppPassword(accountId, newName);
      setGeneratedPassword(result.app_passwd);
      setNewName("");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "passwords", accountId],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create app password");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAppPassword(accountId, id);
      toast.success("App password deleted");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "passwords", accountId],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete app password");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">App Passwords</h3>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New App Password
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create App Password</DialogTitle>
              <DialogDescription>
                Generate a unique password for a mail client (e.g. Outlook,
                Thunderbird).
              </DialogDescription>
            </DialogHeader>
            {generatedPassword ? (
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <p className="mb-2 font-medium text-green-600 text-sm dark:text-green-400">
                    Password generated successfully!
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 select-all rounded bg-muted p-2 font-mono text-lg">
                      {generatedPassword}
                    </code>
                  </div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    Copy this password now. It will not be shown again.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setGeneratedPassword(null);
                    setIsDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="font-medium text-sm" htmlFor="app-name">
                    App Name
                  </label>
                  <Input
                    id="app-name"
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. My Phone, Outlook"
                    value={newName}
                  />
                </div>
                <DialogFooter>
                  <Button
                    disabled={!newName || isCreating}
                    onClick={handleCreate}
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Generate Password
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {passwords.length === 0 ? (
            <p className="rounded-lg border border-dashed py-4 text-center text-muted-foreground text-sm">
              No app passwords created yet.
            </p>
          ) : (
            passwords.map((pw) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                key={pw.id}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {pw.name || "Unnamed"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Created {pw.created ? formatDate(pw.created) : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pw.active === 1 ? (
                    <Badge
                      className="border-green-500/20 bg-green-500/10 text-green-600"
                      variant="secondary"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  <Button
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(pw.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
