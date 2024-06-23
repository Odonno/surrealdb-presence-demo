import { useMutation } from "@tanstack/react-query";
import { usePageVisibility } from "react-page-visibility";
import { useInterval } from "usehooks-ts";
import signalPresenceQuery from "@/mutations/signalPresence.surql?raw";
import { useEffect } from "react";
import { SECOND } from "@/constants/time";
import { useSurrealDbClient } from "@/contexts/surrealdb-provider";

const SIGNAL_PRESENCE_INTERVAL = 10 * SECOND;

const SignalPresence = () => {
  const isPageVisible = usePageVisibility();
  const canSignalPresence = isPageVisible;

  const dbClient = useSurrealDbClient();

  const signalPresence = useMutation({
    mutationFn: async () => {
      const response = await dbClient.query(signalPresenceQuery);

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

  useEffect(() => {
    if (canSignalPresence) {
      signalPresence.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible]);

  return null;
};

export default SignalPresence;
