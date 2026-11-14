/**
 * Timezone and Date Utility for The Jawed Habib Salon – Lalganj
 * Ground Truth: Asia/Kolkata (UTC+05:30)
 */

export const SALON_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_NO_SHOW_GRACE_MINUTES = 30; // 30 minutes grace period after start time

const kolkataDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SALON_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const kolkataTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: SALON_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Returns current date string in Asia/Kolkata ("YYYY-MM-DD")
 */
export function getKolkataDateString(date: Date = new Date()): string {
  return kolkataDateFormatter.format(date);
}

/**
 * Returns current time string in Asia/Kolkata ("HH:mm")
 */
export function getKolkataTimeString(date: Date = new Date()): string {
  return kolkataTimeFormatter.format(date);
}

/**
 * Parses appointment date and time into a Date in Asia/Kolkata (+05:30)
 */
export function parseKolkataDateTime(dateStr: string, timeStr: string): Date {
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const cleanTime = timeStr.trim();
  const isoStr = `${cleanDate}T${cleanTime.length === 5 ? cleanTime + ":00" : cleanTime}+05:30`;
  return new Date(isoStr);
}

/**
 * Evaluates whether an appointment is eligible to be marked NO_SHOW.
 * An appointment is ONLY eligible if:
 * 1. The appointment scheduled date is in the past, OR
 * 2. If it is scheduled for today, the scheduled start time + grace period has passed in Asia/Kolkata.
 */
export function checkNoShowEligibility(
  appointmentDate: string | Date,
  startTime: string,
  graceMinutes: number = DEFAULT_NO_SHOW_GRACE_MINUTES
): {
  isEligible: boolean;
  scheduledTimeIST: string;
  currentTimeIST: string;
  eligibleAfterIST: string;
  reason?: string;
} {
  const now = new Date();
  const todayIST = getKolkataDateString(now);
  const currentTimeIST = getKolkataTimeString(now);

  const aptDateIST =
    typeof appointmentDate === "string"
      ? appointmentDate.includes("T")
        ? appointmentDate.split("T")[0]
        : appointmentDate
      : getKolkataDateString(appointmentDate);

  const scheduledDateTime = parseKolkataDateTime(aptDateIST, startTime);
  const eligibleAfterMs = scheduledDateTime.getTime() + graceMinutes * 60 * 1000;
  const eligibleAfterDate = new Date(eligibleAfterMs);
  const eligibleAfterIST = `${getKolkataDateString(eligibleAfterDate)} ${getKolkataTimeString(eligibleAfterDate)}`;

  // Future appointment date
  if (aptDateIST > todayIST) {
    return {
      isEligible: false,
      scheduledTimeIST: `${aptDateIST} ${startTime}`,
      currentTimeIST: `${todayIST} ${currentTimeIST}`,
      eligibleAfterIST,
      reason: `Cannot mark a future appointment (${aptDateIST} at ${startTime} IST) as NO_SHOW. Customer has not yet missed their scheduled visit.`,
    };
  }

  // Today's appointment
  if (aptDateIST === todayIST) {
    if (now.getTime() < eligibleAfterMs) {
      const minutesRemaining = Math.max(1, Math.ceil((eligibleAfterMs - now.getTime()) / (60 * 1000)));
      return {
        isEligible: false,
        scheduledTimeIST: `${aptDateIST} ${startTime}`,
        currentTimeIST: `${todayIST} ${currentTimeIST}`,
        eligibleAfterIST,
        reason: `Cannot mark appointment as NO_SHOW until the scheduled time (${startTime} IST) and grace period (${graceMinutes} mins) have elapsed. Eligible in ${minutesRemaining} minutes at ${getKolkataTimeString(eligibleAfterDate)} IST.`,
      };
    }
  }

  // Past appointment or today's grace period elapsed
  return {
    isEligible: true,
    scheduledTimeIST: `${aptDateIST} ${startTime}`,
    currentTimeIST: `${todayIST} ${currentTimeIST}`,
    eligibleAfterIST,
  };
}

