import type { Room, RoomUser } from "@/lib/models";
import { useQueryClient } from "@tanstack/react-query";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { useRoomUsers, useRoomUsersLive } from "@/api/roomUsers";
import UserHoverCard from "./UserHoverCard";

export type RoomUserProps = {
  room: Room;
};

const RoomUsers = (props: RoomUserProps) => {
  const { room } = props;

  const queryClient = useQueryClient();

  const { data: users, isSuccess } = useRoomUsers(room.id, room.is_in_room);
  const { data: liveQueryUuid } = useRoomUsersLive(
    room.id,
    room.is_in_room && isSuccess
  );

  useLiveQuery({
    queryUuid: liveQueryUuid ?? "",
    callback: ({ action, result }) => {
      if (action === "CREATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(room.id)._ctx.users.queryKey,
          (old: RoomUser[]) => [...old, result as unknown as RoomUser]
        );
      }

      if (action === "UPDATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(room.id)._ctx.users.queryKey,
          (old: RoomUser[]) =>
            old.map((u) => {
              if (u.user_id === (result as unknown as RoomUser).user_id) {
                return result as unknown as RoomUser;
              }

              return u;
            })
        );
      }
    },
    enabled: Boolean(liveQueryUuid),
  });

  useEffectOnce(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(room.id)._ctx.users.queryKey,
      });
    };
  });

  return (
    <section>
      <ul className="flex flex-wrap gap-3 max-w-[300px]">
        {(users || []).map((u) => (
          <li key={u.user_id}>
            <UserHoverCard user={u} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RoomUsers;
