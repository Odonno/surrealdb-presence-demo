import { SurrealInstance } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import roomsQuery from "@/queries/rooms.surql?raw";

type Room = {
  id: string;
  name: string;
};

const Rooms = () => {
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<Room[]> => {
      const result = await SurrealInstance.opiniatedQuery<Room>(roomsQuery);

      console.log(result);
      if (!result?.[0]?.result) {
        throw new Error();
      }

      return result[0].result;
    },
  });

  return (
    <>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Rooms
      </h3>

      <ul>
        {rooms?.map((room) => {
          return <li key={room.id}>{room.name}</li>;
        })}
      </ul>
    </>
  );
};

export default Rooms;
