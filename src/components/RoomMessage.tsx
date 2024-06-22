import { useCurrentUser } from "@/api/currentUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { RoomMessage as RoomMessageModel } from "@/lib/models";
import {
  CalendarIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  SendIcon,
} from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "short",
});

export type RoomMessageProps = {
  message: RoomMessageModel;
};

const RoomMessage = ({ message }: RoomMessageProps) => {
  const { data: currentUser } = useCurrentUser(true);

  const sentAt = dateFormatter.format(new Date(message.created_at));

  if (message.type === "ENTER_ROOM" || message.type === "LEAVE_ROOM") {
    const isEntering = message.type === "ENTER_ROOM";

    const isSelf = currentUser?.id === message.author.id;
    const username = isSelf ? "You" : `@${message.author.username}`;

    const content = isEntering
      ? `${username} joined the room`
      : `${username} left the room`;

    return (
      <Alert>
        {isEntering ? (
          <DoorClosedIcon className="h-4 w-4" />
        ) : (
          <DoorOpenIcon className="h-4 w-4" />
        )}
        <AlertDescription>
          <div>{content}</div>

          <div className="flex items-center pt-1">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            <span className="text-xs text-muted-foreground">{sentAt}</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (message.type === "TEXT_MESSAGE") {
    const isSelf = currentUser?.id === message.author.id;
    const username = isSelf ? "You" : `@${message.author.username}`;

    const title = `${username} sent a message`;

    return (
      <Alert>
        <SendIcon className="h-4 w-4" />

        <AlertTitle>{title}</AlertTitle>

        <AlertDescription>
          <div>{message.content}</div>

          <div className="flex items-center pt-1">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            <span className="text-xs text-muted-foreground">{sentAt}</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default RoomMessage;
