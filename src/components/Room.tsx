import type { Room as RoomType } from "@/lib/models";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { surrealInstance } from "@/lib/db";
import joinRoomQuery from "@/mutations/joinRoom.surql?raw";
import leaveRoomQuery from "@/mutations/leaveRoom.surql?raw";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type RoomProps = {
  room: RoomType;
};

const Room = (props: RoomProps) => {
  const { room } = props;

  const queryClient = useQueryClient();

  const joinRoom = useMutation({
    mutationFn: async () => {
      const response = await surrealInstance.query(joinRoomQuery, {
        room_id: room.id,
      });

      if (!response?.[0] || response[0].error) {
        throw new Error();
      }

      // optimistic update
      queryClient.setQueryData(["rooms"], (old: RoomType[]) => {
        return old.map((r) => {
          if (r.id === room.id) {
            return {
              ...r,
              is_in_room: true,
            };
          }

          return r;
        });
      });
    },
  });

  const leaveRoom = useMutation({
    mutationFn: async () => {
      const response = await surrealInstance.query(leaveRoomQuery, {
        room_id: room.id,
      });

      if (!response?.[0] || response[0].error) {
        throw new Error();
      }

      // optimistic update
      queryClient.setQueryData(["rooms"], (old: RoomType[]) => {
        return old.map((r) => {
          if (r.id === room.id) {
            return {
              ...r,
              is_in_room: false,
            };
          }

          return r;
        });
      });
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
          <CardTitle> {room.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There are no user on this room...</p>
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