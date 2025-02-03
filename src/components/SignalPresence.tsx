import { SECOND } from "@/constants/time";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";
import signalPresenceQuery from "@/mutations/signalPresence.surql?raw";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePageVisibility } from "react-page-visibility";
import { useInterval } from "usehooks-ts";

const SIGNAL_PRESENCE_INTERVAL = 10 * SECOND;

const SignalPresence = () => {
	const isPageVisible = usePageVisibility();
	const canSignalPresence = isPageVisible;

	const dbClient = useSurrealDbClient();

	const signalPresence = useMutation({
		mutationKey: ["signalPresence"],
		mutationFn: async () => {
			await dbClient.query(signalPresenceQuery);
		},
	});

	useInterval(
		() => {
			signalPresence.mutate();
		},
		canSignalPresence ? SIGNAL_PRESENCE_INTERVAL : null,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (canSignalPresence) {
			signalPresence.mutate();
		}
	}, [isPageVisible]);

	return null;
};

export default SignalPresence;
