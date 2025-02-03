import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { queryKeys } from "@/lib/queryKeys";
import canCreateRoomQuery from "@/queries/canCreateRoom.surql?raw";
import { useQuery } from "@tanstack/react-query";

export const useCanCreateRoom = () => {
	const dbClient = useSurrealDbClient();

	const canCreateRoomAsync = async () => {
		const response = await dbClient.query<[boolean]>(canCreateRoomQuery);
		return response[0];
	};

	return useQuery({
		...queryKeys.rooms.canCreate,
		queryFn: canCreateRoomAsync,
	});
};
