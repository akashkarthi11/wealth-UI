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

const MONEY_FORMATS = new Map<string, Intl.NumberFormat>();

// Money with the currency symbol and Indian digit grouping (₹1,26,297.54); other currencies keep their own symbol.
export const formatMoney = (amount: number | null | undefined, currency = "INR"): string => {
  if (amount === null || amount === undefined) return "—";
  let format = MONEY_FORMATS.get(currency);
  if (!format) {
    format = new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    MONEY_FORMATS.set(currency, format);
  }
  return format.format(amount);
};

const STAMP_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

// A timestamp from the API (ISO) in Indian time.
export const formatStamp = (stamp: string | null | undefined): string => {
  if (!stamp) return "";
  const date = new Date(stamp);
  return Number.isNaN(date.getTime()) ? "" : STAMP_FORMAT.format(date);
};
