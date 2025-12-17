"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "~/components/makerkit/data-table";
import { If } from "~/components/makerkit/if";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { AdminAccountRow } from "~/features/admin/lib/server/loaders/admin-accounts.loader";

import { AdminDeleteAccountDialog } from "./admin-delete-account-dialog";
import { AdminDeleteUserDialog } from "./admin-delete-user-dialog";
import { AdminImpersonateUserDialog } from "./admin-impersonate-user-dialog";
import { AdminResetPasswordDialog } from "./admin-reset-password-dialog";

type Account = AdminAccountRow;

const FiltersSchema = z.object({
  type: z.enum(["all", "team", "personal"]),
  query: z.string().optional(),
});

export function AdminAccountsTable(
  props: React.PropsWithChildren<{
    data: Account[];
    pageCount: number;
    pageSize: number;
    page: number;
    filters: {
      type: "all" | "team" | "personal";
      query: string;
    };
  }>
) {
  return (
    <div className={"flex flex-col space-y-4"}>
      <div className={"flex justify-end"}>
        <AccountsTableFilters filters={props.filters} />
      </div>

      <div className={"rounded-lg border p-2"}>
        <DataTable
          columns={getColumns()}
          data={props.data}
          pageCount={props.pageCount}
          pageIndex={props.page - 1}
          pageSize={props.pageSize}
        />
      </div>
    </div>
  );
}

function AccountsTableFilters(props: {
  filters: z.infer<typeof FiltersSchema>;
}) {
  const form = useForm({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      type: props.filters?.type ?? "all",
      query: props.filters?.query ?? "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const pathName = usePathname();

  const onSubmit = ({
    type: filterType,
    query: searchQuery,
  }: z.infer<typeof FiltersSchema>) => {
    const params = new URLSearchParams({
      account_type: filterType,
      query: searchQuery ?? "",
    });

    const url = `${pathName}?${params.toString()}`;

    router.push(url);
  };

  const type = useWatch({ control: form.control, name: "type" });

  return (
    <Form {...form}>
      <form
        className={"flex gap-2.5"}
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
      >
        <Select
          onValueChange={(value) => {
            form.setValue(
              "type",
              value as z.infer<typeof FiltersSchema>["type"],
              {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              }
            );

            return onSubmit(form.getValues());
          }}
          value={type}
        >
          <SelectTrigger>
            <SelectValue placeholder={"Account Type"} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Account Type</SelectLabel>

              <SelectItem value={"all"}>All accounts</SelectItem>
              <SelectItem value={"team"}>Team</SelectItem>
              <SelectItem value={"personal"}>Personal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <FormField
          name={"query"}
          render={({ field }) => (
            <FormItem>
              <FormControl className={"w-full min-w-36 md:min-w-80"}>
                <Input
                  className={"w-full"}
                  data-test={"admin-accounts-table-filter-input"}
                  placeholder={"Search account..."}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function getColumns(): ColumnDef<Account>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          className={"hover:underline"}
          href={`/admin/accounts/${row.original.id}`}
          prefetch={false}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (row.original.isPersonalAccount ? "Personal" : "Team"),
    },
    {
      id: "created_at",
      header: "Created At",
      accessorKey: "createdAt",
    },
    {
      id: "updated_at",
      header: "Updated At",
      accessorKey: "updatedAt",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isPersonalAccount = row.original.isPersonalAccount;
        const userId = row.original.id;

        return (
          <div className={"flex justify-end"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={"icon"} variant={"outline"}>
                  <EllipsisVertical className={"h-4"} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align={"end"}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  <DropdownMenuItem>
                    <Link
                      className={"h-full w-full"}
                      href={`/admin/accounts/${userId}`}
                    >
                      View
                    </Link>
                  </DropdownMenuItem>

                  <If condition={isPersonalAccount}>
                    <AdminResetPasswordDialog userId={userId}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Send Reset Password link
                      </DropdownMenuItem>
                    </AdminResetPasswordDialog>

                    <AdminImpersonateUserDialog userId={userId}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Impersonate User
                      </DropdownMenuItem>
                    </AdminImpersonateUserDialog>

                    <AdminDeleteUserDialog userId={userId}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Delete Personal Account
                      </DropdownMenuItem>
                    </AdminDeleteUserDialog>
                  </If>

                  <If condition={!isPersonalAccount}>
                    <AdminDeleteAccountDialog accountId={row.original.id}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Delete Team Account
                      </DropdownMenuItem>
                    </AdminDeleteAccountDialog>
                  </If>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
