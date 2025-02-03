import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { RoomMessage } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import roomMessagesQuery from "@/queries/roomMessages.surql?raw";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RoomMessage as RoomMessageModel } from "@/lib/models";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { useMount } from "@/hooks/useMount";
import type { Uuid } from "surrealdb";

const MAX_MESSAGES = 3;

const useRoomMessages = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomMessagesAsync = async () => {
    const response = await dbClient.query<[RoomMessage[]]>(roomMessagesQuery, {
      room_id: roomId,
    });

    return response[0];
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.messages,
    queryFn: getRoomMessagesAsync,
    enabled,
  });
};

const useRoomMessagesLive = (roomId: string, enabled: boolean) => {
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
    const response = await dbClient.query<[Uuid]>(query);
    return response[0];
  };

  return useQuery({
    ...queryKeys.rooms.detail(roomId)._ctx.messages._ctx.live,
    queryFn: getRoomMessagesLiveAsync,
    enabled,
  });
};

export const useRealtimeRoomMessages = (roomId: string, enabled: boolean) => {
  const queryClient = useQueryClient();

  const { data: messages, isSuccess } = useRoomMessages(roomId, enabled);
  const { data: liveQueryUuid } = useRoomMessagesLive(
    roomId,
    enabled && isSuccess
  );

  useLiveQuery({
    queryUuid: liveQueryUuid,
    callback: (action, result) => {
      if (action === "CREATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(roomId)._ctx.messages.queryKey,
          (old: RoomMessageModel[]) =>
            [result as unknown as RoomMessageModel, ...old].slice(
              0,
              MAX_MESSAGES
            )
        );
      }
    },
    enabled: Boolean(liveQueryUuid),
  });

  useMount(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(roomId)._ctx.messages.queryKey,
      });
    };
  });

  return messages;
};
