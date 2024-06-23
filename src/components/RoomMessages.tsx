import type { Room, RoomMessage as RoomMessageModel } from "@/lib/models";
import RoomMessage from "./RoomMessage";
import { useQueryClient } from "@tanstack/react-query";
import { useRoomMessages, useRoomMessagesLive } from "@/api/roomMessages";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { queryKeys } from "@/lib/queryKeys";

type RoomMessagesProps = {
  room: Room;
};

const RoomMessages = ({ room }: RoomMessagesProps) => {
  const queryClient = useQueryClient();

  const { data: messages, isSuccess } = useRoomMessages(
    room.id,
    room.is_in_room
  );
  const { data: liveQueryUuid } = useRoomMessagesLive(
    room.id,
    room.is_in_room && isSuccess
  );

  useLiveQuery({
    queryUuid: liveQueryUuid ?? "",
    callback: ({ action, result }) => {
      if (action === "CREATE") {
        queryClient.setQueryData(
          queryKeys.rooms.detail(room.id)._ctx.messages.queryKey,
          (old: RoomMessageModel[]) =>
            [result as unknown as RoomMessageModel, ...old].slice(0, 3)
        );
      }
    },
    enabled: Boolean(liveQueryUuid),
  });

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
