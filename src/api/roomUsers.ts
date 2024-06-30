import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { useMount } from "@/hooks/useMount";
import type { RoomUser } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import roomUsersQuery from "@/queries/roomUsers.surql?raw";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MAX_USERS = 12;

const useRoomUsers = (roomId: string, enabled: boolean) => {
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

const useRoomUsersLive = (roomId: string, enabled: boolean) => {
  const dbClient = useSurrealDbClient();

  const getRoomUsersLiveAsync = async () => {
    // 💡 cannot use params with LIVE queries at the moment
    // 💡 cannot use ORDER BY statement in LQ
    // see https://github.com/surrealdb/surrealdb/issues/2641
    const query = `LIVE ${roomUsersQuery}`
      .replace("$room_id", roomId)
      .replace(/ORDER BY (.+)([^;|\n])/g, "")
      .replace(/LIMIT ([^;|\n])/g, "");
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

export const useRealtimeRoomUsers = (roomId: string, enabled: boolean) => {
  const queryClient = useQueryClient();

  const { data: users, isSuccess } = useRoomUsers(roomId, enabled);
  const { data: liveQueryUuid } = useRoomUsersLive(
    roomId,
    enabled && isSuccess
  );

  useLiveQuery({
    queryUuid: liveQueryUuid ?? "",
    callback: ({ action, result }) => {
      if (action === "CREATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(roomId)._ctx.users.queryKey,
          (old: RoomUser[]) =>
            [...old, result as unknown as RoomUser].slice(0, MAX_USERS)
        );
      }

      if (action === "UPDATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(roomId)._ctx.users.queryKey,
          (old: RoomUser[]) =>
            old
              .map((u) => {
                if (u.user_id === (result as unknown as RoomUser).user_id) {
                  return result as unknown as RoomUser;
                }

                return u;
              })
              .toSorted(
                (a, b) =>
                  new Date(b.last_presence!).getTime() -
                  new Date(a.last_presence!).getTime()
              )
              .slice(0, MAX_USERS)
        );
      }
    },
    enabled: Boolean(liveQueryUuid),
  });

  useMount(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(roomId)._ctx.users.queryKey,
      });
    };
  });

  return users;
};
