export type Id = string;

export type User = {
  id: Id;
  username: string;
  avatar?: string;
  avatarFallback: string;
};

export type Room = {
  id: Id;
  name: string;
  created_at: string;
  is_in_room: boolean;
  number_of_active_users: number;
  can_leave: boolean;
  messages: RoomMessage[];
};

export type PresenceStatus = "joined" | "left";

export type RoomUser = {
  user_id: Id;
  username: string;
  avatar?: string;
  avatarFallback: string;
  last_presence?: string;
  registered_at: string;
};

export type RoomMessageType = "ENTER_ROOM" | "LEAVE_ROOM" | "TEXT_MESSAGE";

export type RoomMessage = {
  id: Id;
  author: {
    id: Id;
    username: string;
  };
  type: RoomMessageType;
  content?: string;
  created_at: string;
};
