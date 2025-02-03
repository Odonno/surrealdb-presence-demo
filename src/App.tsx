import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Surreal } from "surrealdb";
import { DB, NS, SURREAL_ENDPOINT } from "./constants/db";
import { ACCESS_TOKEN } from "./constants/storage";
import {
	type ConnectFn,
	SurrealDbProvider,
} from "./contexts/surrealdb-provider";
import { ThemeProvider } from "./contexts/theme-provider";
import HomePage from "./pages/HomePage";

const queryClient = new QueryClient();
const surrealClient = new Surreal();

const App = () => {
	const connect: ConnectFn = async ({ client, endpoint, params }) => {
		await client.connect(endpoint, params);

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
				<ReactQueryDevtools initialIsOpen={false} />

				<SurrealDbProvider
					client={surrealClient}
					endpoint={SURREAL_ENDPOINT}
					params={{ namespace: NS, database: DB }}
					connectFn={connect}
				>
					<HomePage />
				</SurrealDbProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
};

export default App;
