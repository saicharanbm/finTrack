// Helper function to get current date in dd/mm/yyyy format
export function getCurrentDate(): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  return `${day}/${month}/${year}`;
}

// Helper function to convert dd/mm/yyyy to Date object
export function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

export function getSinceDate(range?: string): Date | undefined {
  if (!range) return undefined;
  const now = new Date();
  const d = new Date(now);
  switch (range.toLowerCase()) {
    case "week":
      d.setDate(now.getDate() - 7);
      return d;
    case "month":
      d.setMonth(now.getMonth() - 1);
      return d;
    case "3month":
      d.setMonth(now.getMonth() - 3);
      return d;
    case "year":
      d.setFullYear(now.getFullYear() - 1);
      return d;
    case "all":
      return undefined;
    default:
      return undefined;
  }
}

export function serializeTxn(t: any) {
  return {
    ...t,
    amountPaise:
      typeof t.amountPaise === "bigint" ? Number(t.amountPaise) : t.amountPaise,
  };
}

/** Serialize an array of transactions. */
export function serializeTxns(txns: any[]) {
  return txns.map(serializeTxn);
}
