import {
  type UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import type { Json } from "~/core/auth/better-auth/types";
import { getPersonalAccountDataAction } from "../server/personal-accounts-server-actions";

type PersonalAccountData = {
  id: string;
  name: string | null;
  picture_url: string | null;
  public_data: Record<string, unknown> | null;
} | null;

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    public_data?: Json;
  }
): UseQueryResult<PersonalAccountData, Error> {
  const queryKey = ["account:data", userId] as const;

  const queryFn = async (): Promise<PersonalAccountData> => {
    if (!userId) {
      return null;
    }

    try {
      const result = await getPersonalAccountDataAction(userId);

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        name: result.name ?? null,
        picture_url: result.picture_url ?? null,
        public_data:
          (result.public_data as Record<string, unknown> | null) ?? null,
      };
    } catch (error) {
      throw error;
    }
  };

  return useQuery<
    PersonalAccountData,
    Error,
    PersonalAccountData,
    typeof queryKey
  >({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache null results
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          name: partialAccount.name,
          picture_url: partialAccount.picture_url,
          public_data:
            (partialAccount.public_data as Record<string, unknown> | null) ??
            null,
        }
      : undefined, // Use undefined instead of null to avoid caching null
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
