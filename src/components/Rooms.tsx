import { useQuery } from "@tanstack/react-query";
import Room from "./Room";
import { queryKeys } from "@/lib/queryKeys";

const Rooms = () => {
  const { data: rooms } = useQuery({
    ...queryKeys.rooms.list,
  });

  const isInOneRoom = (rooms || []).some((room) => room.is_in_room);

  return (
    <>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Rooms
      </h3>

      <ul className="mt-6 flex flex-row gap-2">
        {rooms?.map((room) => {
          if (isInOneRoom && !room.is_in_room) {
            return null;
          }

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
