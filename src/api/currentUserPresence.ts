import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import currentUserPresenceQuery from "@/queries/currentUserPresence.surql?raw";

export const useCurrentUserPresenceAsync = (): (() => Promise<Date>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const response = await dbClient.query<[string]>(currentUserPresenceQuery);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return new Date(response[0].result);
  };

  return fn;
};

export const useCurrentUserPresenceLiveAsync = (): (() => Promise<string>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const query = `LIVE ${currentUserPresenceQuery}`;
    const response = await dbClient.query<[string]>(query);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return response[0].result;
  };

  return fn;
};
