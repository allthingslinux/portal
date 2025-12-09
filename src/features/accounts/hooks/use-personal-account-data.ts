import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { Json } from "~/core/database/supabase/database.types";
import { getPersonalAccountDataAction } from "../server/personal-accounts-server-actions";

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    public_data?: Json;
  }
) {
  const queryKey = ["account:data", userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    return await getPersonalAccountDataAction(userId);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          name: partialAccount.name,
          picture_url: partialAccount.picture_url,
          public_data: partialAccount.public_data,
        }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ["account:data", userId],
      }),
    [queryClient]
  );
}
