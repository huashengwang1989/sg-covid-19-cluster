function normDateForDisplay(date: string) {
  if (!date) {
    return "-";
  }
  const [, m = "-", d = "-"] = date.split("/");
  return `${m}/${d}`;
}

export function normDateOrPeriodForDisplay(date: string | [string, string]) {
  const norm = normDateForDisplay;
  if (Array.isArray(date)) {
    return `${norm(date[0])} - ${norm(date[1])}`;
  }
  return norm(date);
}
