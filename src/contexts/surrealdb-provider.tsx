import { createContext, useContext, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useEffectOnce } from "usehooks-ts";
import { Surreal } from "surrealdb.js";

export type ConnectFnProps = {
  client: Surreal;
  endpoint: string;
  params?: Parameters<Surreal["connect"]>[1];
};

export type ConnectFn = (props: ConnectFnProps) => Promise<void>;

type SurrealDbProviderProps = {
  children: React.ReactNode;
  client: Surreal | undefined;
  endpoint: string;
  params?: Parameters<Surreal["connect"]>[1];
  autoconnect?: boolean;
  connectFn?: ConnectFn;
};

type SurrealDbProviderState = {
  client: Surreal | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  connect: () => Promise<void>;
};

const initialState: SurrealDbProviderState = {
  client: undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  connect: async () => {},
};

const SurrealDbProviderContext =
  createContext<SurrealDbProviderState>(initialState);

export function SurrealDbProvider({
  children,
  client,
  endpoint,
  params,
  autoconnect = true,
  connectFn,
  ...props
}: SurrealDbProviderProps) {
  const surrealInstance = useMemo(() => client ?? new Surreal(), [client]);

  const connectDb = useMutation({
    mutationKey: ["connect", endpoint, params],
    mutationFn: async () => {
      if (connectFn) {
        await connectFn({ client: surrealInstance, endpoint, params });
      } else {
        await surrealInstance.connect(`${endpoint}/rpc`, params);
      }

      return true;
    },
  });

  const connect = async () => {
    await connectDb.mutateAsync();
  };

  useEffectOnce(() => {
    if (autoconnect) {
      connect();
    }

    return () => {
      connectDb.reset();
      surrealInstance.close();
    };
  });

  const value = {
    client: surrealInstance,
    isLoading: connectDb.isPending,
    isSuccess: connectDb.isSuccess,
    isError: connectDb.isError,
    error: connectDb.error,
    connect,
  };

  return (
    <SurrealDbProviderContext.Provider {...props} value={value}>
      {children}
    </SurrealDbProviderContext.Provider>
  );
}

export const useSurrealDb = () => {
  const context = useContext(SurrealDbProviderContext);

  if (context === undefined)
    throw new Error("useSurrealDb must be used within a SurrealDbProvider");

  return context;
};

export const useSurrealDbClient = () => {
  const { client } = useSurrealDb();
  return client!;
};
