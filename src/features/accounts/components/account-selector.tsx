"use client";

import { CaretSortIcon, PersonIcon } from "@radix-ui/react-icons";
import { CheckCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "~/components/lib/utils";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";

import { CreateTeamAccountDialog } from "~/features/team-accounts/components/create-team-account-dialog";
import { usePersonalAccountData } from "../hooks/use-personal-account-data";

type AccountSelectorProps = {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image?: string | null;
  }>;

  features: {
    enableTeamCreation: boolean;
  };

  userId: string;
  selectedAccount?: string;
  collapsed?: boolean;
  className?: string;
  collisionPadding?: number;

  onAccountChange: (value: string | undefined) => void;
};

const PERSONAL_ACCOUNT_SLUG = "personal";

export function AccountSelector({
  accounts,
  selectedAccount,
  onAccountChange,
  userId,
  className,
  features = {
    enableTeamCreation: true,
  },
  collapsed = false,
  collisionPadding = 20,
}: React.PropsWithChildren<AccountSelectorProps>) {
  const [open, setOpen] = useState<boolean>(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const { t } = useTranslation("teams");
  const personalData = usePersonalAccountData(userId);

  const value = useMemo(
    () => selectedAccount ?? PERSONAL_ACCOUNT_SLUG,
    [selectedAccount]
  );

  const selected = accounts.find((account) => account.value === value);
  const pictureUrl = personalData.data?.picture_url;

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              "group mr-1 w-full min-w-0 px-2 lg:w-auto lg:max-w-fit dark:shadow-primary/10",
              {
                "justify-start": !collapsed,
                "m-auto justify-center px-2 lg:w-full": collapsed,
              },
              className
            )}
            data-test={"account-selector-trigger"}
            role="combobox"
            size={collapsed ? "icon" : "default"}
            variant="ghost"
          >
            <If
              condition={selected}
              fallback={
                <span
                  className={cn("flex max-w-full items-center", {
                    "justify-center gap-x-0": collapsed,
                    "gap-x-2": !collapsed,
                  })}
                >
                  <PersonalAccountAvatar pictureUrl={pictureUrl} />

                  <span
                    className={cn("truncate", {
                      hidden: collapsed,
                    })}
                  >
                    <Trans i18nKey={"teams:personalAccount"} />
                  </span>
                </span>
              }
            >
              {(account) => (
                <span
                  className={cn("flex max-w-full items-center", {
                    "justify-center gap-x-0": collapsed,
                    "gap-x-2": !collapsed,
                  })}
                >
                  <Avatar className={"h-6 w-6 rounded-xs"}>
                    <AvatarImage src={account.image ?? undefined} />

                    <AvatarFallback
                      className={"rounded-xs group-hover:bg-muted"}
                    >
                      {account.label ? account.label[0] : ""}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn("truncate", {
                      hidden: collapsed,
                    })}
                  >
                    {account.label}
                  </span>
                </span>
              )}
            </If>

            <CaretSortIcon
              className={cn("ml-1 h-4 w-4 shrink-0 opacity-50", {
                hidden: collapsed,
              })}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-full p-0"
          collisionPadding={collisionPadding}
          data-test={"account-selector-content"}
        >
          <Command shouldFilter={false}>
            <CommandInput className="h-9" placeholder={t("searchAccount")} />

            <CommandList>
              <CommandGroup>
                <CommandItem
                  className="shadow-none"
                  onSelect={() => onAccountChange(undefined)}
                  value={PERSONAL_ACCOUNT_SLUG}
                >
                  <PersonalAccountAvatar />

                  <span className={"ml-2"}>
                    <Trans i18nKey={"teams:personalAccount"} />
                  </span>

                  <Icon selected={value === PERSONAL_ACCOUNT_SLUG} />
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <If condition={accounts.length > 0}>
                <CommandGroup
                  heading={
                    <Trans
                      i18nKey={"teams:yourTeams"}
                      values={{ teamsCount: accounts.length }}
                    />
                  }
                >
                  {(accounts ?? []).map((account, index) => (
                    <CommandItem
                      className={cn(
                        "group my-1 flex justify-between shadow-none transition-colors",
                        {
                          "bg-muted": value === account.value,
                        }
                      )}
                      data-name={account.label}
                      data-slug={account.value}
                      data-test={"account-selector-team"}
                      key={account.value ?? `account-${index}`}
                      onSelect={(currentValue) => {
                        setOpen(false);

                        if (onAccountChange) {
                          onAccountChange(currentValue);
                        }
                      }}
                      value={account.value ?? ""}
                    >
                      <div className={"flex items-center"}>
                        <Avatar className={"mr-2 h-6 w-6 rounded-xs"}>
                          <AvatarImage src={account.image ?? undefined} />

                          <AvatarFallback
                            className={cn("rounded-xs text-foreground", {
                              "bg-background": value === account.value,
                              "group-hover:bg-background":
                                value !== account.value,
                            })}
                          >
                            {account.label ? account.label[0] : ""}
                          </AvatarFallback>
                        </Avatar>

                        <span className={"mr-2 max-w-[165px] truncate"}>
                          {account.label}
                        </span>
                      </div>

                      <Icon selected={(account.value ?? "") === value} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </If>
            </CommandList>
          </Command>

          <Separator />

          <If condition={features.enableTeamCreation}>
            <div className={"p-1"}>
              <Button
                className="w-full justify-start font-normal text-sm"
                data-test={"create-team-account-trigger"}
                onClick={() => {
                  setIsCreatingAccount(true);
                  setOpen(false);
                }}
                size={"sm"}
                variant="ghost"
              >
                <Plus className="mr-3 h-4 w-4" />

                <span>
                  <Trans i18nKey={"teams:createTeam"} />
                </span>
              </Button>
            </div>
          </If>
        </PopoverContent>
      </Popover>

      <If condition={features.enableTeamCreation}>
        <CreateTeamAccountDialog
          isOpen={isCreatingAccount}
          setIsOpen={setIsCreatingAccount}
        />
      </If>
    </>
  );
}

function UserAvatar(props: { pictureUrl?: string }) {
  return (
    <Avatar className={"h-6 w-6 rounded-xs"}>
      <AvatarImage src={props.pictureUrl} />
    </Avatar>
  );
}

function Icon({ selected }: { selected: boolean }) {
  return (
    <CheckCircle
      className={cn("ml-auto h-4 w-4", selected ? "opacity-100" : "opacity-0")}
    />
  );
}

function PersonalAccountAvatar({ pictureUrl }: { pictureUrl?: string | null }) {
  return pictureUrl ? (
    <UserAvatar pictureUrl={pictureUrl} />
  ) : (
    <PersonIcon className="h-5 w-5" />
  );
}
