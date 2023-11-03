import { surrealInstance } from "@/lib/db";
import roomsQuery from "@/queries/rooms.surql?raw";
import type { Room } from "@/lib/models";

export const getRoomsAsync = async (): Promise<Room[]> => {
  const response = await surrealInstance.query<[Room[]]>(roomsQuery);

  if (!response?.[0]?.result) {
    throw new Error();
  }

  return response[0].result;
};
