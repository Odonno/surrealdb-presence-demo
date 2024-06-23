import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { RoomUser } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import roomUsersQuery from "@/queries/roomUsers.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useRoomUsers = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomUsersAsync = async () => {
    const response = await dbClient.query<[RoomUser[]]>(roomUsersQuery, {
      room_id: roomId,
    });

    if (!response?.[0] || response[0].status !== "OK") {
      throw new Error();
    }

    return response[0].result;
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.users,
    queryFn: getRoomUsersAsync,
    enabled,
  });
};

export const useRoomUsersLive = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomUsersLiveAsync = async () => {
    // 💡 cannot use params with LIVE queries at the moment
    // see https://github.com/surrealdb/surrealdb/issues/2641
    const query = `LIVE ${roomUsersQuery}`.replace("$room_id", roomId);
    const response = await dbClient.query<[string]>(query);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return response[0].result;
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.users._ctx.live,
    queryFn: getRoomUsersLiveAsync,
    enabled,
  });
};
