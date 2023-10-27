import { createContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { surrealInstance } from "@/lib/db";
import { DB, NS, SURREAL_ENDPOINT } from "@/constants/db";
import { ACCESS_TOKEN } from "@/constants/storage";
import { useEffectOnce } from "usehooks-ts";

type SurrealDbProviderProps = {
  children: React.ReactNode;
};

const ThemeProviderContext = createContext(undefined);

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

  // TODO : loading screen & error

  return (
    <ThemeProviderContext.Provider {...props} value={undefined}>
      {connectDb.isSuccess ? children : null}
    </ThemeProviderContext.Provider>
  );
}
