import {
  createQueryKeys,
  mergeQueryKeys,
} from "@lukemorales/query-key-factory";

const usersKeys = createQueryKeys("users", {
  current: {
    queryKey: null,
    contextQueries: {
      presence: {
        queryKey: null,
        contextQueries: {
          live: {
            queryKey: null,
          },
        },
      },
    },
  },
});

export const roomsKeys = createQueryKeys("rooms", {
  list: {
    queryKey: null,
  },
  canCreate: {
    queryKey: null,
  },
  detail: (roomId: string) => ({
    queryKey: [roomId],
    queryFn: null,
    contextQueries: {
      messages: {
        queryKey: null,
        contextQueries: {
          live: {
            queryKey: null,
          },
        },
      },
      users: {
        queryKey: null,
        contextQueries: {
          live: {
            queryKey: null,
          },
        },
      },
    },
  }),
});

export const queryKeys = mergeQueryKeys(usersKeys, roomsKeys);
