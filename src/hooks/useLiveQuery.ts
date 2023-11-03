import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { LiveQueryResponse } from "node_modules/surrealdb.js/esm/types";
import { useEffect } from "react";

export type UseLiveQueryProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = {
  queryUuid: string;
  callback: (data: LiveQueryResponse<T>) => unknown;
  enabled?: boolean;
};

export const useLiveQuery = ({
  queryUuid,
  callback,
  enabled = true,
}: UseLiveQueryProps) => {
  const dbClient = useSurrealDbClient();

  useEffect(() => {
    if (enabled) {
      const runLiveQuery = async () => {
        await dbClient.listenLive(queryUuid, callback);
      };

      const clearLiveQuery = async () => {
        await dbClient.kill(queryUuid);
      };

      const handleBeforeUnload = () => {
        clearLiveQuery();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      runLiveQuery();

      return () => {
        clearLiveQuery();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUuid, enabled]);
};
