import type { Room as RoomType } from "@/lib/models";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import joinRoomQuery from "@/mutations/joinRoom.surql?raw";
import leaveRoomQuery from "@/mutations/leaveRoom.surql?raw";
import signalPresenceQuery from "@/mutations/signalPresence.surql?raw";
import { DoorClosed, DoorOpen, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffectOnce, useInterval } from "usehooks-ts";
import { SECOND } from "@/constants/time";
import RoomUsers from "./RoomUsers";
import { usePageVisibility } from "react-page-visibility";
import { queryKeys } from "@/lib/queryKeys";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";

export type RoomProps = {
  room: RoomType;
};

const SIGNAL_PRESENCE_INTERVAL = 10 * SECOND;

const Room = (props: RoomProps) => {
  const { room } = props;

  const isPageVisible = usePageVisibility();

  const canSignalPresence = room.is_in_room && isPageVisible;

  const queryClient = useQueryClient();
  const dbClient = useSurrealDbClient();

  const signalPresence = useMutation({
    mutationFn: async () => {
      const response = await dbClient.query(signalPresenceQuery, {
        room_id: room.id,
      });

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }
    },
  });

  useInterval(
    () => {
      signalPresence.mutate();
    },
    canSignalPresence ? SIGNAL_PRESENCE_INTERVAL : null
  );

  useEffectOnce(() => {
    if (canSignalPresence) {
      signalPresence.mutate();
    }
  });

  const joinRoom = useMutation({
    mutationFn: async () => {
      const response = await dbClient.query(joinRoomQuery, {
        room_id: room.id,
      });

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }

      // optimistic update
      queryClient.setQueryData(
        queryKeys.rooms.list.queryKey,
        (old: RoomType[]) => {
          return old.map((r) => {
            if (r.id === room.id) {
              return {
                ...r,
                is_in_room: true,
              };
            }

            return r;
          });
        }
      );
    },
  });

  const leaveRoom = useMutation({
    mutationFn: async () => {
      const response = await dbClient.query(leaveRoomQuery, {
        room_id: room.id,
      });

      if (!response?.[0] || response[0].status !== "OK") {
        throw new Error();
      }

      // optimistic update
      queryClient.setQueryData(
        queryKeys.rooms.list.queryKey,
        (old: RoomType[]) => {
          return old.map((r) => {
            if (r.id === room.id) {
              return {
                ...r,
                is_in_room: false,
              };
            }

            return r;
          });
        }
      );
    },
  });

  const handleJoinRoom = async () => {
    await joinRoom.mutateAsync();
  };

  const handleLeaveRoom = async () => {
    await leaveRoom.mutateAsync();
  };

  return (
    <Card className="min-w-[250px]">
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
      </CardHeader>

      <CardContent>
        {room.is_in_room ? (
          <RoomUsers room={room} />
        ) : room.number_of_active_users ? (
          <p className="text-sm font-medium leading-none">
            There are {room.number_of_active_users} user(s) in this room...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            There are no user in this room...
          </p>
        )}
      </CardContent>

      <CardFooter className="p-0">
        {room.is_in_room ? (
          <>
            {room.can_leave ? (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-t-none"
                onClick={handleLeaveRoom}
                disabled={leaveRoom.isPending}
              >
                {leaveRoom.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DoorOpen className="mr-2 h-4 w-4" />
                )}
                Leave
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled
                className="w-full rounded-t-none"
              >
                This a cosy room.
              </Button>
            )}
          </>
        ) : (
          <Button
            type="button"
            variant="default"
            className="w-full rounded-t-none"
            onClick={handleJoinRoom}
            disabled={joinRoom.isPending}
          >
            {joinRoom.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DoorClosed className="mr-2 h-4 w-4" />
            )}
            Join this room
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Room;
