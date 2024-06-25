import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { queryKeys } from "@/lib/queryKeys";
import currentUserPresenceQuery from "@/queries/currentUserPresence.surql?raw";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffectOnce } from "usehooks-ts";

const useCurrentUserPresence = () => {
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

const useCurrentUserPresenceLive = (enabled: boolean) => {
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

export const useRealtimeCurrentUserPresence = () => {
  const queryClient = useQueryClient();

  const { data: lastPresenceDate, isSuccess } = useCurrentUserPresence();
  const { data: liveQueryUuid } = useCurrentUserPresenceLive(isSuccess);

  useLiveQuery({
    queryUuid: liveQueryUuid ?? "",
    callback: ({ action, result }) => {
      if (action === "CREATE" || action === "UPDATE") {
        queryClient.setQueryData(
          queryKeys.users.current._ctx.presence.queryKey,
          new Date(result as unknown as string)
        );
      }
    },
    enabled: Boolean(liveQueryUuid),
  });

  useEffectOnce(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.current._ctx.presence.queryKey,
      });
    };
  });

  return lastPresenceDate;
};
