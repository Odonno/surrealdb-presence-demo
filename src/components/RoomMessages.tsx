import type { Room } from "@/lib/models";
import RoomMessage from "./RoomMessage";
import { useRealtimeRoomMessages } from "@/api/roomMessages";

type RoomMessagesProps = {
  room: Room;
};

const RoomMessages = ({ room }: RoomMessagesProps) => {
  const messages = useRealtimeRoomMessages(room.id, room.is_in_room);

  return (
    <ul className="mt-6 flex flex-col gap-1">
      {(messages || []).map((message) => {
        return (
          <li key={message.id}>
            <RoomMessage message={message} />
          </li>
        );
      })}
    </ul>
  );
};

export default RoomMessages;
