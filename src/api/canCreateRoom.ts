import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { queryKeys } from "@/lib/queryKeys";
import canCreateRoomQuery from "@/queries/canCreateRoom.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useCanCreateRoom = () => {
  const dbClient = useSurrealDbClient();

  const canCreateRoomAsync = async () => {
    const response = await dbClient.query<[string]>(canCreateRoomQuery);

    if (!response?.[0]) {
      throw new Error();
    }

    return response[0].result as unknown as boolean;
  };

  return useQuery({
    ...queryKeys.rooms.canCreate,
    queryFn: canCreateRoomAsync,
  });
};
