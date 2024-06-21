import type { Room, RoomUser } from "@/lib/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { useRoomUsersAsync, useRoomUsersLiveAsync } from "@/api/roomUsers";
import UserHoverCard from "./UserHoverCard";

export type RoomUserProps = {
  room: Room;
};

const RoomUsers = (props: RoomUserProps) => {
  const { room } = props;

  const queryClient = useQueryClient();

  const getRoomUsersAsync = useRoomUsersAsync(room.id);
  const getRoomUsersLiveAsync = useRoomUsersLiveAsync(room.id);

  const { data: users, isSuccess } = useQuery({
    ...queryKeys.rooms.detail(room.id)._ctx.users,
    queryFn: getRoomUsersAsync,
    enabled: room.is_in_room,
  });

  const { data: liveQueryUuid } = useQuery({
    ...queryKeys.rooms.detail(room.id)._ctx.users._ctx.live,
    queryFn: getRoomUsersLiveAsync,
    enabled: room.is_in_room && isSuccess,
  });

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
    <ul className="flex flex-wrap gap-3 max-w-[300px]">
      {(users || []).map((u) => (
        <li key={u.user_id}>
          <UserHoverCard user={u} />
        </li>
      ))}
    </ul>
  );
};

export default RoomUsers;
