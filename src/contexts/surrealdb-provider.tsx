import { createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { surrealInstance } from "@/lib/db";
import { DB, NS, SURREAL_ENDPOINT } from "@/constants/db";
import { ACCESS_TOKEN } from "@/constants/storage";
import { useEffectOnce } from "usehooks-ts";
import { Surreal } from "surrealdb.js";

type SurrealDbProviderProps = {
  children: React.ReactNode;
};

type SurrealDbProviderState = {
  db: Surreal;
};

const initialState: SurrealDbProviderState = {
  db: surrealInstance,
};

const SurrealDbProviderContext =
  createContext<SurrealDbProviderState>(initialState);

export function SurrealDbProvider({
  children,
  ...props
}: SurrealDbProviderProps) {
  const connectDb = useMutation({
    mutationFn: async () => {
      await surrealInstance.connect(`${SURREAL_ENDPOINT}/rpc`, {
        ns: NS,
        db: DB,
      });

      const token = localStorage.getItem(ACCESS_TOKEN);

      if (token) {
        try {
          await surrealInstance.authenticate(token);
        } catch (e) {
          localStorage.removeItem(ACCESS_TOKEN);
          console.error(e);
        }
      }

      return true;
    },
  });

  useEffectOnce(() => {
    connectDb.mutate();
  });

  const value = initialState;

  // TODO : loading screen & error

  return (
    <SurrealDbProviderContext.Provider {...props} value={value}>
      {connectDb.isSuccess ? children : null}
    </SurrealDbProviderContext.Provider>
  );
}

export const useSurrealDb = () => {
  const context = useContext(SurrealDbProviderContext);

  if (context === undefined)
    throw new Error("useSurrealDb must be used within a SurrealDbProvider");

  return context;
};
