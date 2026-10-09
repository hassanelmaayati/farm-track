export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    : "—";

// <input type="date"> wants YYYY-MM-DD.
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value ?? 0);

export const formatMonth = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
};

export const ageFrom = (birthdate) => {
  if (!birthdate) return "—";
  const months = Math.floor((Date.now() - new Date(birthdate)) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 1) return "< 1 mo";
  if (months < 24) return `${months} mo`;
  return `${Math.floor(months / 12)} yr`;
};
