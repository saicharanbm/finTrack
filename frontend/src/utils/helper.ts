export const formatMoney = (paise: number, type: "INCOME" | "EXPENSE") => {
  const rupees = paise / 100;
  const s = rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
  return (type === "INCOME" ? "+" : "-") + s;
};

export const formatDateDDMMYYYY = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
