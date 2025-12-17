import { Trans } from "~/components/portal/trans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Role = string;

export function MembershipRoleSelector({
  roles,
  value,
  currentUserRole,
  onChange,
  triggerClassName,
}: {
  roles: Role[];
  value: Role;
  currentUserRole?: Role;
  onChange: (role: Role) => unknown;
  triggerClassName?: string;
}) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        className={triggerClassName}
        data-test={"role-selector-trigger"}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {roles.map((role) => (
          <SelectItem
            data-test={`role-option-${role}`}
            disabled={currentUserRole === role}
            key={role}
            value={role}
          >
            <span className={"text-sm capitalize"}>
              <Trans defaults={role} i18nKey={`common:roles.${role}.label`} />
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
