import roomsQuery from "@/queries/rooms.surql?raw";
import type { Room } from "@/lib/models";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export const useRooms = () => {
  const dbClient = useSurrealDbClient();

  const getRoomsAsync = async () => {
    const response = await dbClient.query<[Room[]]>(roomsQuery);
    return response[0];
  };

  return useQuery({
    ...queryKeys.rooms.list,
    queryFn: getRoomsAsync,
  });
};
