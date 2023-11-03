import { surrealInstance } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Presence from "./Presence";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";

const CurrentUserPresence = () => {
  const queryClient = useQueryClient();

  const { data: lastPresenceDate, isSuccess } = useQuery({
    ...queryKeys.users.current._ctx.presence,
  });

  const { data: liveQueryUuid } = useQuery({
    ...queryKeys.users.current._ctx.presence._ctx.live,
    enabled: isSuccess,
  });

  useEffect(() => {
    if (liveQueryUuid) {
      const fn = async () => {
        await surrealInstance.listenLive(
          liveQueryUuid,
          ({ action, result }) => {
            if (action === "CREATE" || action === "UPDATE") {
              queryClient.setQueryData(
                queryKeys.users.current._ctx.presence.queryKey,
                new Date(result as unknown as string)
              );
            }
          }
        );
      };

      fn();

      return () => {
        surrealInstance.kill(liveQueryUuid);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveQueryUuid]);

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
