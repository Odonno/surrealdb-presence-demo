import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { LiveHandler, Uuid } from "surrealdb";
import { useEffect } from "react";

export type UseLiveQueryProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = {
  queryUuid: Uuid | undefined;
  callback: LiveHandler<T>;
  enabled?: boolean;
};

export const useLiveQuery = ({
  queryUuid,
  callback,
  enabled = true,
}: UseLiveQueryProps) => {
  const dbClient = useSurrealDbClient();

  useEffect(() => {
    if (enabled && !!queryUuid) {
      const runLiveQuery = async () => {
        await dbClient.subscribeLive(queryUuid, callback);
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
