import { useMutation } from "@tanstack/react-query";
import type { Provider } from "../supabase-types";

/**
 * @deprecated Identity linking needs to be reimplemented with NextAuth
 * This is a placeholder that throws an error
 */
export function useLinkIdentityWithProvider(
  _props: { redirectToPath?: string } = {}
) {
  const mutationKey = ["auth", "link-identity"];

  const mutationFn = (_provider: Provider) => {
    // TODO: Implement identity linking with NextAuth
    throw new Error("Identity linking is not yet implemented with NextAuth");
  };

  return useMutation({ mutationKey, mutationFn });
}
