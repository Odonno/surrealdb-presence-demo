import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { RoomUser } from "@/lib/models";
import roomUsersQuery from "@/queries/roomUsers.surql?raw";
import { sortBy } from "remeda";

export const useRoomUsersAsync = (roomId: string) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const response = await dbClient.query<[RoomUser[]]>(roomUsersQuery, {
      room_id: roomId,
    });

    if (!response?.[0] || response[0].status !== "OK") {
      throw new Error();
    }

    const users = response[0].result;
    return sortBy(users, [(u) => u.updated_at, "desc"]);
  };

  return fn;
};

export const useRoomUsersLiveAsync = (
  roomId: string
): (() => Promise<string>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    // 💡 cannot use params with LIVE queries at the moment
    // see https://github.com/surrealdb/surrealdb/issues/2641
    const query = `LIVE ${roomUsersQuery}`.replace("$room_id", roomId);
    const response = await dbClient.query<[string]>(query);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return response[0].result;
  };

  return fn;
};
