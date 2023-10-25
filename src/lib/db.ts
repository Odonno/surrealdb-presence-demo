import { DB, NS, SURREAL_ENDPOINT } from "@/constants/db";
import { ACCESS_TOKEN } from "@/constants/storage";
import AwaitedSurreal from "@theopensource-company/awaited-surrealdb";

export const SurrealInstance = new AwaitedSurreal({
  endpoint: SURREAL_ENDPOINT,
  namespace: NS,
  database: DB,
  token: async () => localStorage.getItem(ACCESS_TOKEN),
});
