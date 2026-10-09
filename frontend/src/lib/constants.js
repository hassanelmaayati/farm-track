export const STATUSES = ["Healthy", "Sick", "Sold", "Deceased", "Other"];
export const STRUCTURE_TYPES = ["Barn", "Stable", "Coop", "Pen", "Pasture", "Other"];
export const EVENT_TYPES = ["Fed", "Vet Visit", "Vaccination", "Born", "Sold", "Died", "Other"];

// Each status pairs a colour with a text label, so meaning never relies on colour alone.
export const STATUS_STYLES = {
  Healthy: { badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500", chart: "#3f9c4a" },
  Sick: { badge: "bg-red-500/15 text-red-800 dark:text-red-300", dot: "bg-red-500", chart: "#d9534f" },
  Sold: { badge: "bg-sky-500/15 text-sky-800 dark:text-sky-300", dot: "bg-sky-500", chart: "#3b8fd0" },
  Deceased: { badge: "bg-stone-500/20 text-stone-700 dark:text-stone-300", dot: "bg-stone-500", chart: "#8a8a80" },
  Other: { badge: "bg-violet-500/15 text-violet-800 dark:text-violet-300", dot: "bg-violet-500", chart: "#8b6fd0" },
};

export const EVENT_STYLES = {
  Fed: "text-lime-700 dark:text-lime-300",
  "Vet Visit": "text-sky-700 dark:text-sky-300",
  Vaccination: "text-teal-700 dark:text-teal-300",
  Born: "text-emerald-700 dark:text-emerald-300",
  Sold: "text-amber-700 dark:text-amber-300",
  Died: "text-red-700 dark:text-red-300",
  Other: "text-muted",
};
