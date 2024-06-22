import { useQueryClient } from "@tanstack/react-query";
import Presence from "./Presence";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import {
  useCurrentUserPresence,
  useCurrentUserPresenceLive,
} from "@/api/currentUserPresence";

const CurrentUserPresence = () => {
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

  return (
    <Presence lastPresenceDate={lastPresenceDate} className="-ml-1 mt-1" />
  );
};

export default CurrentUserPresence;
