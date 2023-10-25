import Rooms from "@/components/Rooms";
import Header from "@/components/Header";
import { SurrealInstance } from "@/lib/db";
import { User } from "@/lib/models";
import { MissingAuthenticationError } from "@/lib/errors";
import { useQuery } from "@tanstack/react-query";
import currentUserQuery from "@/queries/currentUser.surql?raw";

const HomePage = () => {
  const { data: currentUser } = useQuery({
    queryKey: ["users", "current"],
    queryFn: async (): Promise<User> => {
      const result = await SurrealInstance.opiniatedQuery<User>(
        currentUserQuery
      );

      if (!result?.[0]?.result?.[0]) {
        throw new MissingAuthenticationError();
      }

      return result[0].result[0];
    },
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
