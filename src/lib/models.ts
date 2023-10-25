export type User = {
  username: string;
  avatar?: string;
};

export type Room = {
  id: string;
  name: string;
  created_at: string;
  is_in_room: boolean;
  number_of_active_users: number;
};
