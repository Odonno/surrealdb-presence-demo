import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import getPasscodeQuery from "@/queries/getPasscode.surql?raw";
import { useQuery } from "@tanstack/react-query";

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
