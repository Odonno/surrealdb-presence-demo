import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./contexts/theme-provider";
import { ConnectFn, SurrealDbProvider } from "./contexts/surrealdb-provider";
import { Surreal } from "surrealdb.js";
import { DB, NS, SURREAL_ENDPOINT } from "./constants/db";
import { ACCESS_TOKEN } from "./constants/storage";

const queryClient = new QueryClient();
const surrealClient = new Surreal();

const App = () => {
  const connect: ConnectFn = async ({ client, endpoint, params }) => {
    await client.connect(`${endpoint}/rpc`, params);

    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
      try {
        await client.authenticate(token);
      } catch (e) {
        localStorage.removeItem(ACCESS_TOKEN);
        console.error(e);
      }
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SurrealDbProvider
          client={surrealClient}
          endpoint={SURREAL_ENDPOINT}
          params={{ ns: NS, db: DB }}
          connectFn={connect}
        >
          <HomePage />
        </SurrealDbProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
