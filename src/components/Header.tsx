import { ModeToggle } from "@/components/ModeToggle";
import SignInPopover from "@/components/SignInPopover";
import SignUpDialog from "@/components/SignUpDialog";
import { Button } from "@/components/ui/button";
import { ACCESS_TOKEN } from "@/constants/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import CurrentUserPresence from "./CurrentUserPresence";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import type { User } from "@/lib/models";

type HeaderProps = {
  currentUser: User | undefined;
};

const Header = (props: HeaderProps) => {
  const { currentUser } = props;

  const queryClient = useQueryClient();
  const dbClient = useSurrealDbClient();

  const signout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(ACCESS_TOKEN);
      await dbClient.invalidate();

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
                  alt={currentUser.username}
                />
                <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
              </Avatar>

              <span className="text-lg font-semibold">
                {currentUser.username}
              </span>

              <CurrentUserPresence />
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
