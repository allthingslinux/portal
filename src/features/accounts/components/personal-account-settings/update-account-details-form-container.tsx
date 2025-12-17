"use client";

import { useRevalidatePersonalAccountDataQuery } from "../../hooks/use-personal-account-data";
import { UpdateAccountDetailsForm } from "./update-account-details-form";

export function UpdateAccountDetailsFormContainer({
  user,
}: {
  user: {
    name: string | null;
    id: string;
  };
}) {
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  return (
    <UpdateAccountDetailsForm
      displayName={user.name ?? ""}
      onUpdate={() => revalidateUserDataQuery(user.id)}
      userId={user.id}
    />
  );
}
