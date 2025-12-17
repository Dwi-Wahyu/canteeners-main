import { format } from "date-fns";

export const formatDate = (dateString: Date | null | undefined) => {
  if (!dateString) return "";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export const formatDateWithoutYear = (dateString: Date | null | undefined) => {
  if (!dateString) return "";

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export function formatDateToYYYYMMDD(dateString: Date | null | undefined) {
  if (!dateString) return "";

  return format(new Date(dateString), "yyyy-MM-dd");
}

export const formatDateTimeIndonesian = (
  date: Date | string | number | null | undefined
): string => {
  if (!date) return "";

  const dateObj = new Date(date);

  // Cek apakah date valid
  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("id-ID", { month: "long" });
  const year = dateObj.getFullYear();

  // Format jam dan menit dengan leading zero
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
};
