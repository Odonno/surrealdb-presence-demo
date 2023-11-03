import Rooms from "@/components/Rooms";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useSurrealDb } from "@/contexts/surrealdb-provider";
import { useCurrentUserAsync } from "@/api/currentUser";

const HomePage = () => {
  const { isLoading: isConnecting, isError, error, isSuccess } = useSurrealDb();
  const getCurrentUserAsync = useCurrentUserAsync();

  const { data: currentUser, isLoading } = useQuery({
    ...queryKeys.users.current,
    queryFn: getCurrentUserAsync,
    enabled: isSuccess,
    retry: false,
  });

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error?.message}</p>
      </div>
    );
  }

  if (isConnecting || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header currentUser={currentUser} />

      <section className="mx-12 my-6">
        {currentUser ? (
          <Rooms />
        ) : (
          <p className="flex justify-center items-center mt-40 text-muted-foreground">
            Please sign in or create a new account to use this application.
          </p>
        )}
      </section>
    </>
  );
};

export default HomePage;
