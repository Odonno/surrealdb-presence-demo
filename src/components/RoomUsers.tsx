import type { Room, RoomUser } from "@/lib/models";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Presence from "./Presence";
import { useEffectOnce } from "usehooks-ts";
import { queryKeys } from "@/lib/queryKeys";
import { useLiveQuery } from "@/hooks/useLiveQuery";

export type RoomUserProps = {
  room: Room;
};

const RoomUsers = (props: RoomUserProps) => {
  const { room } = props;

  const queryClient = useQueryClient();

  const { data: users, isSuccess } = useQuery({
    ...queryKeys.rooms.detail(room.id)._ctx.users,
    enabled: room.is_in_room,
  });

  const { data: liveQueryUuid } = useQuery({
    ...queryKeys.rooms.detail(room.id)._ctx.users._ctx.live,
    enabled: room.is_in_room && isSuccess,
  });

  useLiveQuery(liveQueryUuid, ({ action, result }) => {
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
