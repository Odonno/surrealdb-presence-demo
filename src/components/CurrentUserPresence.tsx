import Presence from "./Presence";
import { useRealtimeCurrentUserPresence } from "@/api/currentUserPresence";

const CurrentUserPresence = () => {
  const lastPresenceDate = useRealtimeCurrentUserPresence();

  return (
    <Presence lastPresenceDate={lastPresenceDate} className="-ml-1 mt-1" />
  );
};

export default CurrentUserPresence;
