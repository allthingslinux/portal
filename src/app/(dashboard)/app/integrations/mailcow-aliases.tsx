"use client";

import { useState } from "react";
import { Globe, Loader2, Mail, Plus, Trash2 } from "lucide-react";
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
  createAlias,
  deleteAlias,
  getAliases,
} from "@/features/integrations/lib/mailcow/actions";

interface AliasManagerProps {
  accountId: string;
  email: string;
}

export function AliasManager({ accountId, email: _email }: AliasManagerProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [address, setAddress] = useState("");
  const [goto, setGoto] = useState("");
  const [comment, setComment] = useState("");

  const { data: aliases = [], isLoading } = useQuery({
    queryKey: ["mailcow", "aliases", accountId],
    queryFn: () => getAliases(accountId),
  });

  const handleCreate = async () => {
    if (!(address && goto)) {
      return;
    }
    try {
      setIsCreating(true);
      await createAlias(accountId, {
        address,
        goto,
        public_comment: comment,
        active: true,
      });
      toast.success("Alias created");
      setAddress("");
      setGoto("");
      setComment("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "aliases", accountId],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create alias");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteAlias(accountId, id);
      toast.success("Alias deleted");
      queryClient.invalidateQueries({
        queryKey: ["mailcow", "aliases", accountId],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete alias");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Email Aliases</h3>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Alias
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alias</DialogTitle>
              <DialogDescription>
                Forward emails from a new address to your mailbox or another
                email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="alias-address">
                  Alias Address
                </label>
                <Input
                  id="alias-address"
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="hello@yourdomain.com"
                  value={address}
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="alias-goto">
                  Forward To
                </label>
                <Input
                  id="alias-goto"
                  onChange={(e) => setGoto(e.target.value)}
                  placeholder="your@email.com"
                  value={goto}
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor="alias-comment">
                  Public Comment (Optional)
                </label>
                <Input
                  id="alias-comment"
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Work alias, newsletter, etc."
                  value={comment}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!(address && goto) || isCreating}
                onClick={handleCreate}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Alias
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {aliases.length === 0 ? (
            <p className="rounded-lg border border-dashed py-4 text-center text-muted-foreground text-sm">
              No aliases created yet.
            </p>
          ) : (
            aliases.map((alias) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                key={alias.id}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{alias.address}</p>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Globe className="h-3 w-3" />
                      <span>{alias.goto}</span>
                    </div>
                    {alias.public_comment && (
                      <p className="mt-1 text-muted-foreground text-xs italic">
                        &quot;{alias.public_comment}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alias.active === 1 ? (
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
                    onClick={() => handleDelete(alias.id)}
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
