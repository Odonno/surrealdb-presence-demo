import type { Room as RoomType } from "@/lib/models";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { surrealInstance } from "@/lib/db";
import joinRoomQuery from "@/mutations/joinRoom.surql?raw";
import leaveRoomQuery from "@/mutations/leaveRoom.surql?raw";
import signalPresenceQuery from "@/mutations/signalPresence.surql?raw";
import { Loader2 } from "lucide-react";
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

export type RoomProps = {
  room: RoomType;
};

const SIGNAL_PRESENCE_INTERVAL = 10 * SECOND;

const Room = (props: RoomProps) => {
  const { room } = props;

  const isPageVisible = usePageVisibility();

  const canSignalPresence = room.is_in_room && isPageVisible;

  const queryClient = useQueryClient();

  const signalPresence = useMutation({
    mutationFn: async () => {
      const response = await surrealInstance.query(signalPresenceQuery, {
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
      const response = await surrealInstance.query(joinRoomQuery, {
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
      const response = await surrealInstance.query(leaveRoomQuery, {
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
    <div>
      <Card>
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

        <CardFooter>
          {room.is_in_room ? (
            <Button
              type="button"
              variant="default"
              onClick={handleLeaveRoom}
              disabled={leaveRoom.isPending}
            >
              {leaveRoom.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Leave room
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleJoinRoom}
              disabled={joinRoom.isPending}
            >
              {joinRoom.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Join room
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Room;
