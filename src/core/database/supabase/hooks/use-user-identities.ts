import type { Provider } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useSupabase } from "./use-supabase";

export const USER_IDENTITIES_QUERY_KEY = ["user-identities"];

export function useUserIdentities() {
  const supabase = useSupabase();

  const {
    data: identities = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USER_IDENTITIES_QUERY_KEY,
    queryFn: async () => {
      const { data, error: identitiesError } =
        await supabase.auth.getUserIdentities();

      if (identitiesError) {
        throw identitiesError;
      }

      return data.identities;
    },
  });

  const connectedProviders = useMemo(
    () => identities.map((identity) => identity.provider),
    [identities]
  );

  const hasMultipleIdentities = identities.length > 1;

  const getIdentityByProvider = (provider: Provider) =>
    identities.find((identity) => identity.provider === provider);

  const isProviderConnected = (provider: Provider) =>
    connectedProviders.includes(provider);

  return {
    identities,
    connectedProviders,
    hasMultipleIdentities,
    getIdentityByProvider,
    isProviderConnected,
    isLoading,
    error,
    refetch,
  };
}
