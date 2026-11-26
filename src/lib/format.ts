// Display formatting in one place. Dates are YYYY-MM-DD strings from the API and are shown in Indian English.

const MONTH_FORMAT = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const parse = (day: string | null | undefined): Date | null => {
  if (!day) return null;
  const date = new Date(`${day.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMonth = (day: string | null | undefined): string => {
  const date = parse(day);
  return date ? MONTH_FORMAT.format(date) : "No date";
};

export const formatDay = (day: string | null | undefined): string => {
  const date = parse(day);
  return date ? DAY_FORMAT.format(date) : "";
};

// "sourceName" or "source_name" to "Source name".
export const humanKey = (key: string): string => {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
