"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "~/components/data-table";
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
import type { AdminAccountRow } from "~/features/admin/lib/server/loaders/admin-accounts.loader";

import { AdminDeleteUserDialog } from "./admin-delete-user-dialog";
import { AdminImpersonateUserDialog } from "./admin-impersonate-user-dialog";

type Account = AdminAccountRow;

const FiltersSchema = z.object({
  query: z.string().optional(),
});

export function AdminAccountsTable(
  props: React.PropsWithChildren<{
    data: Account[];
    pageCount: number;
    pageSize: number;
    page: number;
    filters: {
      query?: string;
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
      query: props.filters?.query ?? "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const pathName = usePathname();

  const onSubmit = ({ query: searchQuery }: z.infer<typeof FiltersSchema>) => {
    const params = new URLSearchParams({
      query: searchQuery ?? "",
    });

    const url = `${pathName}?${params.toString()}`;

    router.push(url);
  };

  return (
    <Form {...form}>
      <form
        className={"flex gap-2.5"}
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
      >
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
      cell: () => "Personal", // All accounts are personal now
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

                  {/* All accounts are personal now */}
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
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
