export type User = {
  username: string;
  avatar?: string;
  avatarFallback: string;
};

export type Room = {
  id: string;
  name: string;
  created_at: string;
  is_in_room: boolean;
  number_of_active_users: number;
  can_leave: boolean;
};

export type PresenceStatus = "joined" | "left";

export type RoomUser = {
  user_id: string;
  username: string;
  avatar?: string;
  avatarFallback: string;
  status: PresenceStatus;
  updated_at: string;
  registered_at: string;
};
