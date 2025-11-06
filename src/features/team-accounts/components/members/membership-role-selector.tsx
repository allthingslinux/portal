import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Trans } from '~/components/makerkit/trans';

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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={triggerClassName}
        data-test={'role-selector-trigger'}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {roles.map((role) => {
          return (
            <SelectItem
              key={role}
              data-test={`role-option-${role}`}
              disabled={currentUserRole === role}
              value={role}
            >
              <span className={'text-sm capitalize'}>
                <Trans i18nKey={`common:roles.${role}.label`} defaults={role} />
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
