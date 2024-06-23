import Rooms from "@/components/Rooms";
import Header from "@/components/Header";
import { useSurrealDb } from "@/contexts/surrealdb-provider";
import { useCurrentUser } from "@/api/currentUser";
import SignalPresence from "@/components/SignalPresence";

const HomePage = () => {
  const { isLoading: isConnecting, isError, error, isSuccess } = useSurrealDb();
  const { data: currentUser, isLoading } = useCurrentUser(isSuccess);

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

      <SignalPresence />
    </>
  );
};

export default HomePage;
