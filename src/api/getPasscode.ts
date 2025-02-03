import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import { useQuery } from "@tanstack/react-query";
import getPasscodeQuery from "@/queries/getPasscode.surql?raw";

export const useGetPasscode = (email: string) => {
  const dbClient = useSurrealDbClient();

  return useQuery({
    queryKey: ["passcode", email],
    queryFn: async () => {
      const response = await dbClient.query<[string]>(getPasscodeQuery, {
        email,
      });
      return response?.[0];
    },
    enabled: !!email,
  });
};
