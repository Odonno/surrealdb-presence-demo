import { surrealInstance } from "@/lib/db";
import currentUserPresenceQuery from "@/queries/currentUserPresence.surql?raw";
import liveCurrentUserPresenceQuery from "@/queries/liveCurrentUserPresence.surql?raw";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Presence from "./Presence";
import { useEffectOnce } from "usehooks-ts";

const CurrentUserPresence = () => {
  const queryClient = useQueryClient();

  const { data: lastPresenceDate, isSuccess } = useQuery({
    queryKey: ["users", "current", "presence"],
    queryFn: async (): Promise<Date> => {
      const response = await surrealInstance.query<[string]>(
        currentUserPresenceQuery
      );

      if (!response?.[0]?.result) {
        throw new Error();
      }

      return new Date(response[0].result);
    },
  });

  const { data: liveQueryUuid } = useQuery({
    queryKey: ["users", "current", "presence", "live"],
    queryFn: async (): Promise<string> => {
      const response = await surrealInstance.query<[string]>(
        liveCurrentUserPresenceQuery
      );

      if (!response?.[0]?.result) {
        throw new Error();
      }

      return response[0].result;
    },
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
                ["users", "current", "presence"],
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
        queryKey: ["users", "current", "presence"],
      });
    };
  });

  return (
    <Presence lastPresenceDate={lastPresenceDate} className="-ml-1 mt-1" />
  );
};

export default CurrentUserPresence;
