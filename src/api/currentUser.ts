import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { MissingAuthenticationError } from "@/lib/errors";
import type { User } from "@/lib/models";
import currentUserQuery from "@/queries/currentUser.surql?raw";

export const useCurrentUserAsync = (): (() => Promise<User>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const response = await dbClient.query<[User[]]>(currentUserQuery);

    if (!response?.[0]?.result?.[0]) {
      throw new MissingAuthenticationError();
    }

    return response[0].result[0];
  };

  return fn;
};
