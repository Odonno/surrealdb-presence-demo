import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { MissingAuthenticationError } from "@/lib/errors";
import type { User } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import currentUserQuery from "@/queries/currentUser.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = (enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getCurrentUserAsync = async () => {
    const response = await dbClient.query<[User[]]>(currentUserQuery);

    if (!response?.[0]?.result?.[0]) {
      throw new MissingAuthenticationError();
    }

    return response[0].result[0];
  };

  return useQuery({
    ...queryKeys.users.current,
    queryFn: getCurrentUserAsync,
    enabled,
    retry: false,
  });
};
