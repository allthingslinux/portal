import { useQuery } from "@tanstack/react-query";
import { LoadingOverlay } from "~/components/makerkit/loading-overlay";

export function RolesDataProvider(props: {
  maxRoleHierarchy: number;
  children: (roles: string[]) => React.ReactNode;
}) {
  const rolesQuery = useFetchRoles(props);

  if (rolesQuery.isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (rolesQuery.isError) {
    return null;
  }

  return <>{props.children(rolesQuery.data ?? [])}</>;
}

function useFetchRoles(props: { maxRoleHierarchy: number }) {
  return useQuery({
    queryKey: ["roles", props.maxRoleHierarchy],
    queryFn: async () => {
      // Return static roles ordered by hierarchy
      const roles = ["owner", "admin", "member", "viewer"];
      return roles;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
