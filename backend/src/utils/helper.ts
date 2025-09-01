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
