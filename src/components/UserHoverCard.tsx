import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Presence from "./Presence";
import { CalendarIcon } from "lucide-react";
import { RoomUser } from "@/lib/models";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

type UserHoverCardProps = {
  user: RoomUser;
};

// TODO : React Query to retrieve data

const UserHoverCard = ({ user }: UserHoverCardProps) => {
  const joinedAt = dateFormatter.format(new Date(user.registered_at));

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="relative">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
          </Avatar>

          <Presence
            className="absolute top-0 right-0"
            lastPresenceDate={
              user.status === "joined" ? new Date(user.updated_at) : undefined
            }
          />
        </div>
      </HoverCardTrigger>

      <HoverCardContent>
        <div className="flex justify-around space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
          </Avatar>

          <div>
            <h4 className="text-sm font-semibold">@{user.username}</h4>
            <div className="flex items-center pt-1">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Joined {joinedAt}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
