import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { RoomMessage } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import roomMessagesQuery from "@/queries/roomMessages.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useRoomMessages = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomMessagesAsync = async () => {
    const response = await dbClient.query<[RoomMessage[]]>(roomMessagesQuery, {
      room_id: roomId,
    });

    if (!response?.[0] || response[0].status !== "OK") {
      throw new Error();
    }

    return response[0].result;
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.messages,
    queryFn: getRoomMessagesAsync,
    enabled,
  });
};

export const useRoomMessagesLive = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomMessagesLiveAsync = async () => {
    // 💡 cannot use params with LIVE queries at the moment
    // 💡 cannot use ORDER BY statement in LQ
    // 💡 cannot use LIMIT statement in LQ
    // see https://github.com/surrealdb/surrealdb/issues/2641
    const query = `LIVE ${roomMessagesQuery}`
      .replace("$room_id", roomId)
      .replace(/ORDER BY (.+)([^;|\n])/g, "")
      .replace(/LIMIT ([^;|\n])/g, "");
    console.log(query);
    const response = await dbClient.query<[string]>(query);

    if (!response?.[0]?.result) {
      throw new Error();
    }

    return response[0].result;
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.messages._ctx.live,
    queryFn: getRoomMessagesLiveAsync,
    enabled,
  });
};
