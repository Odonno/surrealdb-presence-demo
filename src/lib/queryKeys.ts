import { getCurrentUserAsync } from "@/api/currentUser";
import {
  getCurrentUserPresenceAsync,
  getCurrentUserPresenceLiveAsync,
} from "@/api/currentUserPresence";
import { getRoomUsersAsync, getRoomUsersLiveAsync } from "@/api/roomUsers";
import { getRoomsAsync } from "@/api/rooms";
import {
  createQueryKeys,
  mergeQueryKeys,
} from "@lukemorales/query-key-factory";

const usersKeys = createQueryKeys("users", {
  current: {
    queryKey: null,
    queryFn: getCurrentUserAsync,
    contextQueries: {
      presence: {
        queryKey: null,
        queryFn: getCurrentUserPresenceAsync,
        contextQueries: {
          live: {
            queryKey: null,
            queryFn: getCurrentUserPresenceLiveAsync,
          },
        },
      },
    },
  },
});

export const roomsKeys = createQueryKeys("rooms", {
  list: {
    queryKey: null,
    queryFn: getRoomsAsync,
  },
  detail: (roomId: string) => ({
    queryKey: [roomId],
    queryFn: null,
    contextQueries: {
      users: {
        queryKey: null,
        queryFn: () => getRoomUsersAsync(roomId),
        contextQueries: {
          live: {
            queryKey: null,
            queryFn: () => getRoomUsersLiveAsync(roomId),
          },
        },
      },
    },
  }),
});

export const queryKeys = mergeQueryKeys(usersKeys, roomsKeys);
