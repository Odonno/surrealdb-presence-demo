import type { Room, RoomUser } from "@/lib/models";
import roomUsersQuery from "@/queries/roomUsers.surql?raw";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { surrealInstance } from "@/lib/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Presence from "./Presence";
import { useEffect } from "react";
import { sortBy } from "remeda";
import { useEffectOnce } from "usehooks-ts";

export type RoomUserProps = {
  room: Room;
};

const RoomUsers = (props: RoomUserProps) => {
  const { room } = props;

  const queryClient = useQueryClient();

  const { data: users, isSuccess } = useQuery({
    queryKey: ["rooms", room.id, "users"],
    queryFn: async () => {
      const response = await surrealInstance.query<[RoomUser[]]>(
        roomUsersQuery,
        {
          room_id: room.id,
        }
      );

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }

      const users = response[0].result;
      return sortBy(users, [(u) => u.updated_at, "desc"]);
    },
    enabled: room.is_in_room,
  });

  const { data: liveQueryUuid } = useQuery({
    queryKey: ["rooms", room.id, "users", "live"],
    queryFn: async (): Promise<string> => {
      // 💡 cannot use params with LIVE queries at the moment
      // see https://github.com/surrealdb/surrealdb/issues/2641
      const query = `LIVE ${roomUsersQuery}`.replace("$room_id", room.id);
      const response = await surrealInstance.query<[string]>(query);

      if (!response?.[0]?.result) {
        throw new Error();
      }

      return response[0].result;
    },
    enabled: room.is_in_room && isSuccess,
  });

  useEffect(() => {
    if (liveQueryUuid) {
      const fn = async () => {
        await surrealInstance.listenLive(
          liveQueryUuid,
          ({ action, result }) => {
            if (action === "CREATE") {
              queryClient.setQueryData(
                ["rooms", room.id, "users"],
                (old: RoomUser[]) => [...old, result as unknown as RoomUser]
              );
            }

            if (action === "UPDATE") {
              queryClient.setQueryData(
                ["rooms", room.id, "users"],
                (old: RoomUser[]) =>
                  old.map((u) => {
                    if (u.user_id === (result as unknown as RoomUser).user_id) {
                      return result as unknown as RoomUser;
                    }

                    return u;
                  })
              );
            }
          }
        );
      };

      fn();

      return () => {
        surrealInstance.kill(liveQueryUuid);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveQueryUuid]);

  useEffectOnce(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", room.id, "users"],
      });
    };
  });

  return (
    <ul className="flex flex-wrap gap-3 max-w-[300px]">
      {(users || []).map((u) => (
        <li key={u.user_id} className="relative">
          <Avatar>
            <AvatarImage src={u.avatar} alt={`${u.username}`} />
            <AvatarFallback>{u.avatarFallback}</AvatarFallback>
          </Avatar>

          <Presence
            className="absolute top-0 right-0"
            lastPresenceDate={
              u.status === "joined" ? new Date(u.updated_at) : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
};

export default RoomUsers;
