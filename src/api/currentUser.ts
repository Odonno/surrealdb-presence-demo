import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { MissingAuthenticationError } from "@/lib/errors";
import type { User } from "@/lib/models";
import currentUserQuery from "@/queries/currentUser.surql?raw";

export const useCurrentUserAsync = (): (() => Promise<User>) => {
  const dbClient = useSurrealDbClient();

  const fn = async () => {
    const result = await dbClient.query<[User[]]>(currentUserQuery);

    if (!result?.[0]?.result?.[0]) {
      throw new MissingAuthenticationError();
    }

    return result[0].result[0];
  };

  return fn;
};
