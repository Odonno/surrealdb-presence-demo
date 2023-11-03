import { surrealInstance } from "@/lib/db";
import { MissingAuthenticationError } from "@/lib/errors";
import type { User } from "@/lib/models";
import currentUserQuery from "@/queries/currentUser.surql?raw";

export const getCurrentUserAsync = async (): Promise<User> => {
  const result = await surrealInstance.query<[User[]]>(currentUserQuery);

  if (!result?.[0]?.result?.[0]) {
    throw new MissingAuthenticationError();
  }

  return result[0].result[0];
};
