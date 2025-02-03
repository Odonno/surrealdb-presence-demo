import { useRealtimeCurrentUserPresence } from "@/api/currentUserPresence";
import Presence from "./Presence";

const CurrentUserPresence = () => {
	const lastPresenceDate = useRealtimeCurrentUserPresence();

	return (
		<Presence lastPresenceDate={lastPresenceDate} className="-ml-1 mt-1" />
	);
};

export default CurrentUserPresence;
