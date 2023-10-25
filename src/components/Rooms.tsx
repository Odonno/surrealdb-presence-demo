import { surrealInstance } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import roomsQuery from "@/queries/rooms.surql?raw";
import type { Room as RoomType } from "@/lib/models";
import Room from "./Room";

const Rooms = () => {
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<RoomType[]> => {
      const response = await surrealInstance.opiniatedQuery<RoomType>(
        roomsQuery
      );

      if (!response?.[0]?.result) {
        throw new Error();
      }

      return response[0].result;
    },
  });

  return (
    <>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Rooms
      </h3>

      <ul className="mt-6 flex flex-row gap-2">
        {rooms?.map((room) => {
          return (
            <li key={room.id}>
              <Room room={room} />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Rooms;
