import { useQuery, useQueryClient } from "@tanstack/react-query";
import Presence from "./Presence";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import {
  useCurrentUserPresenceAsync,
  useCurrentUserPresenceLiveAsync,
} from "@/api/currentUserPresence";

const CurrentUserPresence = () => {
  const queryClient = useQueryClient();

  const getCurrentUserPresenceAsync = useCurrentUserPresenceAsync();
  const getCurrentUserPresenceLiveAsync = useCurrentUserPresenceLiveAsync();

  const { data: lastPresenceDate, isSuccess } = useQuery({
    ...queryKeys.users.current._ctx.presence,
    queryFn: getCurrentUserPresenceAsync,
  });

  const { data: liveQueryUuid } = useQuery({
    ...queryKeys.users.current._ctx.presence._ctx.live,
    queryFn: getCurrentUserPresenceLiveAsync,
    enabled: isSuccess,
  });

  useLiveQuery(liveQueryUuid, ({ action, result }) => {
    if (action === "CREATE" || action === "UPDATE") {
      queryClient.setQueryData(
        queryKeys.users.current._ctx.presence.queryKey,
        new Date(result as unknown as string)
      );
    }
  });

  useEffectOnce(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.current._ctx.presence.queryKey,
      });
    };
  });

  return (
    <Presence lastPresenceDate={lastPresenceDate} className="-ml-1 mt-1" />
  );
};

export default CurrentUserPresence;
