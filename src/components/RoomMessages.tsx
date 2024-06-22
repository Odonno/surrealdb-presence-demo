import { Room } from "@/lib/models";
import RoomMessage from "./RoomMessage";

type RoomMessagesProps = {
  room: Room;
};

const RoomMessages = ({ room }: RoomMessagesProps) => {
  return (
    <ul className="mt-6 flex flex-col gap-1">
      {room.messages.map((message) => {
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
