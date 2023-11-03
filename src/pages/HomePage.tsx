import Rooms from "@/components/Rooms";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

const HomePage = () => {
  const { data: currentUser } = useQuery({
    ...queryKeys.users.current,
  });

  return (
    <>
      <Header />

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
