import { useSurrealDb } from "@/contexts/surrealdb-provider";
import { LiveQueryResponse } from "node_modules/surrealdb.js/esm/types";
import { useEffect } from "react";

export const useLiveQuery = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  queryUuid: string | undefined,
  callback: (data: LiveQueryResponse<T>) => unknown
) => {
  const { db } = useSurrealDb();

  useEffect(() => {
    if (queryUuid) {
      const runLiveQuery = async () => {
        await db.listenLive(queryUuid, callback);
      };

      const clearLiveQuery = async () => {
        await db.kill(queryUuid);
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
  }, [queryUuid]);
};
