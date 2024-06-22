import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { queryKeys } from "@/lib/queryKeys";
import currentUserPresenceQuery from "@/queries/currentUserPresence.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserPresence = () => {
  const dbClient = useSurrealDbClient();

  const getCurrentUserPresenceAsync = async () => {
    const response = await dbClient.query<[string]>(currentUserPresenceQuery);

    if (!response?.[0]?.result?.[0]) {
      throw new Error();
    }

    return new Date(response[0].result);
  };

  return useQuery({
    ...queryKeys.users.current._ctx.presence,
    queryFn: getCurrentUserPresenceAsync,
  });
};

export const useCurrentUserPresenceLive = (enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getCurrentUserPresenceLiveAsync = async () => {
    const query = `LIVE ${currentUserPresenceQuery}`;
    const response = await dbClient.query<[string]>(query);

    if (!response?.[0]?.result?.[0]) {
      throw new Error();
    }

    return response[0].result;
  };

  return useQuery({
    ...queryKeys.users.current._ctx.presence._ctx.live,
    queryFn: getCurrentUserPresenceLiveAsync,
    enabled,
  });
};
