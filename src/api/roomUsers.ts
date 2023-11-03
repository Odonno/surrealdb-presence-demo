import { surrealInstance } from "@/lib/db";
import type { RoomUser } from "@/lib/models";
import roomUsersQuery from "@/queries/roomUsers.surql?raw";
import { sortBy } from "remeda";

export const getRoomUsersAsync = async (roomId: string) => {
  const response = await surrealInstance.query<[RoomUser[]]>(roomUsersQuery, {
    room_id: roomId,
  });

  if (!response?.[0] || response[0].status !== "OK") {
    throw new Error();
  }

  const users = response[0].result;
  return sortBy(users, [(u) => u.updated_at, "desc"]);
};

export const getRoomUsersLiveAsync = async (
  roomId: string
): Promise<string> => {
  // 💡 cannot use params with LIVE queries at the moment
  // see https://github.com/surrealdb/surrealdb/issues/2641
  const query = `LIVE ${roomUsersQuery}`.replace("$room_id", roomId);
  const response = await surrealInstance.query<[string]>(query);

  if (!response?.[0]?.result) {
    throw new Error();
  }

  return response[0].result;
};
