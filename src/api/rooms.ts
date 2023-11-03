import roomsQuery from "@/queries/rooms.surql?raw";
import type { Room } from "@/lib/models";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";

export const useRoomsAsync = (): (() => Promise<Room[]>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const response = await dbClient.query<[Room[]]>(roomsQuery);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return response[0].result;
  };

  return fn;
};
