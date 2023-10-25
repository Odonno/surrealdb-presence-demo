import { ModeToggle } from "@/components/ModeToggle";
import SignInPopover from "@/components/SignInPopover";
import SignUpDialog from "@/components/SignUpDialog";
import { Button } from "@/components/ui/button";
import { ACCESS_TOKEN } from "@/constants/storage";
import { SurrealInstance } from "@/lib/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import currentUserQuery from "@/queries/currentUser.surql?raw";
import { MissingAuthenticationError } from "@/lib/errors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User } from "@/lib/models";
import { LogOut } from "lucide-react";

const Header = () => {
  const queryClient = useQueryClient();

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

  const signout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(ACCESS_TOKEN);
      await SurrealInstance.invalidate();

      return true;
    },
    onSettled: () => {
      queryClient.resetQueries();
    },
  });

  const handleSignOut = async () => {
    await signout.mutateAsync();
  };

  return (
    <>
      <header className="flex px-12 py-4 justify-between items-center">
        {currentUser ? (
          <>
            <div className="flex justify-center items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={currentUser.avatar}
                  alt={`${currentUser.username}`}
                />
                <AvatarFallback>
                  {currentUser.username.slice(0, 2).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-lg font-semibold">
                {currentUser.username}
              </span>

              <span className="bg-green-500 w-2.5 h-2.5 rounded-full -ml-1 mt-1"></span>
            </div>

            <div className="flex justify-center items-center gap-12">
              <Button type="button" variant="secondary" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>

              <ModeToggle />
            </div>
          </>
        ) : (
          <>
            <a href="/">
              <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
                SurrealDB Presence Demo
              </h1>
            </a>

            <div className="flex justify-center items-center gap-12">
              <div className="flex gap-4">
                <SignInPopover />
                <SignUpDialog />
              </div>

              <ModeToggle />
            </div>
          </>
        )}
      </header>

      <Separator />
    </>
  );
};

export default Header;
