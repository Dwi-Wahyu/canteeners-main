import { format, formatISO, parse } from "date-fns";

export function formatToHour(date: Date | null | undefined) {
  if (!date) {
    return "N/A"; // atau string lain yang sesuai, misalnya "--:--"
  }
  return format(date, "HH:mm");
}

export function isTimeWithinRange(now: Date, start: Date, end: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  if (startMinutes <= endMinutes) {
    // Normal case (e.g., 08:00 - 17:00)
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  } else {
    // Crosses midnight (e.g., 22:00 - 02:00)
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
  }
}

export function formatToDatetimeHour(timeString: string | null) {
  if (!timeString) {
    return null;
  }

  const DUMMY_DATE = new Date();

  try {
    const dateObj = parse(timeString, "HH:mm", DUMMY_DATE);

    if (isNaN(dateObj.getTime())) {
      throw new Error("Waktu tidak valid.");
    }

    return formatISO(dateObj);
  } catch (e) {
    console.log(e);

    return null;
  }
}
