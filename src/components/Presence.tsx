import { MINUTE, SECOND } from "@/constants/time";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInterval } from "usehooks-ts";

const GREEN_STATUS_THRESHOLD = 2 * MINUTE;
const ORANGE_STATUS_THRESHOLD = 10 * MINUTE;

const getPresenceBackgroundClass = (
  lastPresenceDate: Date | undefined,
  now: Date
) => {
  if (!lastPresenceDate) {
    return "bg-gray-500";
  }

  const diffTimeInSeconds = now.getTime() - lastPresenceDate.getTime();

  if (diffTimeInSeconds < GREEN_STATUS_THRESHOLD) {
    return "bg-green-500";
  }

  if (diffTimeInSeconds < ORANGE_STATUS_THRESHOLD) {
    return "bg-orange-500";
  }

  return "bg-red-500";
};

export type PresenceProps = {
  lastPresenceDate?: Date;
  className?: string;
};

const Presence = (props: PresenceProps) => {
  const { lastPresenceDate, className } = props;

  const [now, setNow] = useState(new Date());

  useInterval(() => {
    setNow(new Date());
  }, SECOND);

  const bgClass = getPresenceBackgroundClass(lastPresenceDate, now);

  return (
    <span className={cn(className, "w-2.5 h-2.5 rounded-full", bgClass)} />
  );
};

export default Presence;
