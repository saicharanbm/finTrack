export const formatMoney = (paise: number, type: "INCOME" | "EXPENSE") => {
  const rupees = paise / 100;
  const s = rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
  return (type === "INCOME" ? "+" : "-") + s;
};

export const formatDateDDMMYYYY = (d: string | Date): string => {
  // 1) Already dd/mm/yyyy? return as-is (even if it's an invalid calendar date).
  if (typeof d === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    return d;
  }

  // 2) ISO yyyy-mm-dd → dd/mm/yyyy (avoid Date parsing/timezone issues)
  if (typeof d === "string") {
    const mISO = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mISO) {
      const [, yyyy, mm, dd] = mISO;
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  // 3) Date object or other parseable string → format via Date
  const dateObj = d instanceof Date ? d : new Date(d);
  if (isNaN(dateObj.getTime())) {
    // Fallback: if it's an unparseable string, return it unchanged; otherwise empty string
    return typeof d === "string" ? d : "";
  }
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const fmtINR = (paise: number) =>
  (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
