import type { Room } from "@/lib/models";
import { useRealtimeRoomUsers } from "@/api/roomUsers";
import UserHoverCard from "./UserHoverCard";

export type RoomUserProps = {
  room: Room;
};

const RoomUsers = ({ room }: RoomUserProps) => {
  const users = useRealtimeRoomUsers(room.id, room.is_in_room);

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
