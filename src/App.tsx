import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./contexts/theme-provider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
