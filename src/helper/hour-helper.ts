import { format, formatISO, parse } from "date-fns";

export function formatToHour(date: Date | null | undefined) {
  if (!date) {
    return "N/A";
  }
  return format(date, "HH:mm");
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

export function isTimeWithinRange(now: Date, openTime?: Date | null, closeTime?: Date | null): boolean {
  if (!openTime || !closeTime) return true;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = new Date(openTime).getHours() * 60 + new Date(openTime).getMinutes();
  const closeMinutes = new Date(closeTime).getHours() * 60 + new Date(closeTime).getMinutes();
  if (openMinutes <= closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}
