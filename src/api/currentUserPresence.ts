import { surrealInstance } from "@/lib/db";
import currentUserPresenceQuery from "@/queries/currentUserPresence.surql?raw";

export const getCurrentUserPresenceAsync = async (): Promise<Date> => {
  const response = await surrealInstance.query<[string]>(
    currentUserPresenceQuery
  );

  if (!response?.[0]?.result) {
    throw new Error();
  }

  return new Date(response[0].result);
};

export const getCurrentUserPresenceLiveAsync = async (): Promise<string> => {
  const query = `LIVE ${currentUserPresenceQuery}`;
  const response = await surrealInstance.query<[string]>(query);

  if (!response?.[0]?.result) {
    throw new Error();
  }

  return response[0].result;
};
