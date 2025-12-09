"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingOverlay } from "~/components/makerkit/loading-overlay";
import { Trans } from "~/components/makerkit/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useSession } from "~/core/auth/better-auth/hooks";
import { ErrorBoundary } from "~/core/monitoring/api/components/error-boundary";

import {
  deleteTeamAccountAction,
  leaveTeamAccountAction,
} from "../../server/actions/team-account-server-actions";

export function TeamAccountDangerZone({
  account,
  primaryOwnerUserId,
  features,
}: React.PropsWithChildren<{
  account: {
    name: string;
    id: string;
  };

  features: {
    enableTeamDeletion: boolean;
  };

  primaryOwnerUserId: string;
}>) {
  const { data: user } = useSession();

  if (!user) {
    return <LoadingOverlay fullPage={false} />;
  }

  // Only the primary owner can delete the team account
  const userIsPrimaryOwner = user.id === primaryOwnerUserId;

  if (userIsPrimaryOwner) {
    if (features.enableTeamDeletion) {
      return (
        <DangerZoneCard>
          <DeleteTeamContainer account={account} />
        </DangerZoneCard>
      );
    }

    return;
  }

  // A primary owner can't leave the team account
  // but other members can
  return (
    <DangerZoneCard>
      <LeaveTeamContainer account={account} />
    </DangerZoneCard>
  );
}

function DeleteTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  return (
    <div className={"flex flex-col space-y-4"}>
      <div className={"flex flex-col space-y-1"}>
        <span className={"font-medium text-sm"}>
          <Trans i18nKey={"teams:deleteTeam"} />
        </span>

        <p className={"text-muted-foreground text-sm"}>
          <Trans
            i18nKey={"teams:deleteTeamDescription"}
            values={{
              teamName: props.account.name,
            }}
          />
        </p>
      </div>

      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-test={"delete-team-trigger"}
              type={"button"}
              variant={"destructive"}
            >
              <Trans i18nKey={"teams:deleteTeam"} />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans i18nKey={"teams:deletingTeam"} />
              </AlertDialogTitle>

              <AlertDialogDescription>
                <Trans
                  i18nKey={"teams:deletingTeamDescription"}
                  values={{
                    teamName: props.account.name,
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>

            <DeleteTeamConfirmationForm
              id={props.account.id}
              name={props.account.name}
            />
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function DeleteTeamConfirmationForm({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { data: user } = useSession();

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(
      z.object({
        // OTP requirement removed
      })
    ),
    defaultValues: {},
  });

  if (!user?.email) {
    return <LoadingOverlay fullPage={false} />;
  }

  return (
    <ErrorBoundary fallback={<DeleteTeamErrorAlert />}>
      <Form {...form}>
        <form
          action={deleteTeamAccountAction}
          className={"flex flex-col space-y-4"}
          data-test={"delete-team-form"}
        >
          <div className={"flex flex-col space-y-2"}>
            <div
              className={
                "my-4 flex flex-col space-y-2 rounded-md border-2 border-destructive p-4 text-destructive text-sm"
              }
            >
              <div>
                <Trans
                  i18nKey={"teams:deleteTeamDisclaimer"}
                  values={{
                    teamName: name,
                  }}
                />
              </div>

              <div className={"text-sm"}>
                <Trans i18nKey={"common:modalConfirmationQuestion"} />
              </div>
            </div>

            <input name={"accountId"} type="hidden" value={id} />
            <input name={"otp"} type="hidden" value="" />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey={"common:cancel"} />
            </AlertDialogCancel>

            <DeleteTeamSubmitButton />
          </AlertDialogFooter>
        </form>
      </Form>
    </ErrorBoundary>
  );
}

function DeleteTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={"delete-team-form-confirm-button"}
      disabled={pending}
      variant={"destructive"}
    >
      <Trans i18nKey={"teams:deleteTeam"} />
    </Button>
  );
}

function LeaveTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        confirmation: z.string().refine((value) => value === "LEAVE", {
          message: "Confirmation required to leave team",
          path: ["confirmation"],
        }),
      })
    ),
    defaultValues: {
      confirmation: "" as "LEAVE",
    },
  });

  return (
    <div className={"flex flex-col space-y-4"}>
      <p className={"text-muted-foreground text-sm"}>
        <Trans
          i18nKey={"teams:leaveTeamDescription"}
          values={{
            teamName: props.account.name,
          }}
        />
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div>
            <Button
              data-test={"leave-team-button"}
              type={"button"}
              variant={"destructive"}
            >
              <Trans i18nKey={"teams:leaveTeam"} />
            </Button>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans i18nKey={"teams:leavingTeamModalHeading"} />
            </AlertDialogTitle>

            <AlertDialogDescription>
              <Trans i18nKey={"teams:leavingTeamModalDescription"} />
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ErrorBoundary fallback={<LeaveTeamErrorAlert />}>
            <Form {...form}>
              <form
                action={leaveTeamAccountAction}
                className={"flex flex-col space-y-4"}
              >
                <input
                  name={"accountId"}
                  type={"hidden"}
                  value={props.account.id}
                />

                <FormField
                  name={"confirmation"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey={"teams:leaveTeamInputLabel"} />
                      </FormLabel>

                      <FormControl>
                        <Input
                          autoComplete={"off"}
                          className="w-full"
                          data-test="leave-team-input-field"
                          pattern="LEAVE"
                          placeholder=""
                          required
                          type="text"
                          {...field}
                        />
                      </FormControl>

                      <FormDescription>
                        <Trans i18nKey={"teams:leaveTeamInputDescription"} />
                      </FormDescription>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Trans i18nKey={"common:cancel"} />
                  </AlertDialogCancel>

                  <LeaveTeamSubmitButton />
                </AlertDialogFooter>
              </form>
            </Form>
          </ErrorBoundary>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LeaveTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={"confirm-leave-organization-button"}
      disabled={pending}
      variant={"destructive"}
    >
      <Trans i18nKey={"teams:leaveTeam"} />
    </Button>
  );
}

function LeaveTeamErrorAlert() {
  return (
    <div className={"flex flex-col space-y-4"}>
      <Alert variant={"destructive"}>
        <AlertTitle>
          <Trans i18nKey={"teams:leaveTeamErrorHeading"} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={"common:genericError"} />
        </AlertDescription>
      </Alert>

      <AlertDialogFooter>
        <AlertDialogCancel>
          <Trans i18nKey={"common:cancel"} />
        </AlertDialogCancel>
      </AlertDialogFooter>
    </div>
  );
}

function DeleteTeamErrorAlert() {
  return (
    <div className={"flex flex-col space-y-4"}>
      <Alert variant={"destructive"}>
        <AlertTitle>
          <Trans i18nKey={"teams:deleteTeamErrorHeading"} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={"common:genericError"} />
        </AlertDescription>
      </Alert>

      <AlertDialogFooter>
        <AlertDialogCancel>
          <Trans i18nKey={"common:cancel"} />
        </AlertDialogCancel>
      </AlertDialogFooter>
    </div>
  );
}

function DangerZoneCard({ children }: React.PropsWithChildren) {
  return (
    <Card className={"border border-destructive"}>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey={"teams:settings.dangerZone"} />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey={"teams:settings.dangerZoneDescription"} />
        </CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
