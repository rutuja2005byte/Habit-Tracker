export const todayKey = () => new Date().toISOString().slice(0, 10);

export const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));

export const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const lastNDays = (days: number) =>
  Array.from({ length: days }, (_, index) => daysAgo(days - index - 1));

export const isWithinDays = (date: string, days: number) => {
  const target = new Date(date).getTime();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return target >= start.getTime();
};
