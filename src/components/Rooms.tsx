import { useMutation, useQuery } from "@tanstack/react-query";
import Room from "./Room";
import { queryKeys } from "@/lib/queryKeys";
import { useRoomsAsync } from "@/api/rooms";
import { Button } from "./ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import createRoomQuery from "@/mutations/createRoom.surql?raw";
import { useCanCreateRoomAsync } from "@/api/canCreateRoom";

const Rooms = () => {
  const dbClient = useSurrealDbClient();
  const getRoomsAsync = useRoomsAsync();
  const canCreateRoomAsync = useCanCreateRoomAsync();

  const { data: rooms } = useQuery({
    ...queryKeys.rooms.list,
    queryFn: getRoomsAsync,
  });

  const { data: canCreateRoom } = useQuery({
    ...queryKeys.rooms.canCreate,
    queryFn: canCreateRoomAsync,
  });

  const yourRooms = (rooms || []).filter((room) => room.is_in_room);
  const otherRooms = (rooms || []).filter((room) => !room.is_in_room);

  const createRoom = useMutation({
    mutationFn: async () => {
      const response = await dbClient.query(createRoomQuery);

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }

      // TODO
    },
  });

  const handleCreateRoom = async () => {
    await createRoom.mutateAsync();
  };

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Your rooms
        </h3>

        {yourRooms.length > 0 ? (
          <ul className="mt-6 flex flex-row gap-2">
            {yourRooms.map((room) => {
              return (
                <li key={room.id}>
                  <Room room={room} />
                </li>
              );
            })}
          </ul>
        ) : null}

        {canCreateRoom ? (
          <Button variant="outline" className="mt-4" onClick={handleCreateRoom}>
            {createRoom.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="mr-2 h-4 w-4" />
            )}
            Create a room
          </Button>
        ) : null}
      </section>

      <section>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          All rooms
        </h3>

        <ul className="mt-6 flex flex-row gap-2">
          {otherRooms.map((room) => {
            return (
              <li key={room.id}>
                <Room room={room} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default Rooms;
