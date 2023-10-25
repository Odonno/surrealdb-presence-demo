import Rooms from "@/components/Rooms";
import Header from "@/components/Header";
import { surrealInstance } from "@/lib/db";
import type { User } from "@/lib/models";
import { MissingAuthenticationError } from "@/lib/errors";
import { useQuery } from "@tanstack/react-query";
import currentUserQuery from "@/queries/currentUser.surql?raw";

const HomePage = () => {
  const { data: currentUser } = useQuery({
    queryKey: ["users", "current"],
    queryFn: async (): Promise<User> => {
      const response = await surrealInstance.opiniatedQuery<User>(
        currentUserQuery
      );

      if (!response?.[0]?.result?.[0]) {
        throw new MissingAuthenticationError();
      }

      return response[0].result[0];
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
