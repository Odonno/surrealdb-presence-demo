import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import canCreateRoomQuery from "@/queries/canCreateRoom.surql?raw";

export const useCanCreateRoomAsync = (): (() => Promise<boolean>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const response = await dbClient.query<[string]>(canCreateRoomQuery);

    if (!response?.[0]) {
      throw new Error();
    }

    return response[0].result as unknown as boolean;
  };

  return fn;
};
