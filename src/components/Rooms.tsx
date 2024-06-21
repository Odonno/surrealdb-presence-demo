import { useQuery } from "@tanstack/react-query";
import Room from "./Room";
import { queryKeys } from "@/lib/queryKeys";
import { useRoomsAsync } from "@/api/rooms";

const Rooms = () => {
  const getRoomsAsync = useRoomsAsync();

  const { data: rooms } = useQuery({
    ...queryKeys.rooms.list,
    queryFn: getRoomsAsync,
  });

  const yourRooms = (rooms || []).filter((room) => room.is_in_room);
  const otherRooms = (rooms || []).filter((room) => !room.is_in_room);

  return (
    <div className="flex flex-col gap-4">
      {yourRooms.length > 0 ? (
        <section>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Your rooms
          </h3>

          <ul className="mt-6 flex flex-row gap-2">
            {yourRooms?.map((room) => {
              return (
                <li key={room.id}>
                  <Room room={room} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          All rooms
        </h3>

        <ul className="mt-6 flex flex-row gap-2">
          {otherRooms?.map((room) => {
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
