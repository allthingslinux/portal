import { Menu } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function AdminMobileNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={"h-8 w-8"} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href={"/admin"}>Home</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={"/admin/accounts"}>Accounts</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
