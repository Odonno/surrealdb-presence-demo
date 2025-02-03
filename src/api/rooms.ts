import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { Room } from "@/lib/models";
import { queryKeys } from "@/lib/queryKeys";
import roomsQuery from "@/queries/rooms.surql?raw";
import { useQuery } from "@tanstack/react-query";

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
