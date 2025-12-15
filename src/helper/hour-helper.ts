import { format, formatISO, parse } from "date-fns";

export function formatToHour(date: Date | null | undefined) {
  if (!date) {
    return "N/A"; // atau string lain yang sesuai, misalnya "--:--"
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
