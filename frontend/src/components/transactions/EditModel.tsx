import { cn } from "@/utils";
import React from "react";
import { useUpdateTransactions } from "@/services/mutations";
import type { CategoriesType, TransactionType } from "@/types";
import { formatDateDDMMYYYY } from "@/utils/helper";

export const EditModal: React.FC<{
  open: boolean;
  txn: TransactionType | null;
  onClose: () => void;
}> = ({ open, txn, onClose }) => {
  const { mutateAsync: updateTxn, isPending } = useUpdateTransactions();
  const [form, setForm] = React.useState(() =>
    txn
      ? {
          title: txn.title,
          category: txn.category,
          type: txn.type,
          amountPaise: txn.amountPaise,
          date: txn.date,
        }
      : null
  );

  React.useEffect(() => {
    if (!txn) return setForm(null);
    setForm({
      title: txn.title,
      category: txn.category,
      type: txn.type,
      amountPaise: txn.amountPaise,
      date: formatDateDDMMYYYY(txn.date),
    });
  }, [txn]);

  if (!open || !txn || !form) return null;

  const onSave = async () => {
    await updateTxn({
      id: txn.id,
      data: {
        title: form.title,
        category: form.category,
        type: form.type,
        amountPaise: form.amountPaise,
        date: formatDateDDMMYYYY(form.date), // server uses z.coerce.date() or parses string
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(96vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-background p-5 shadow-2xl">
        <h3 className="mb-4 text-xl font-semibold">Edit Transaction</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Title</span>
            <input
              className="rounded border border-card-border bg-white dark:bg-background px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Date</span>
            <input
              type="date"
              className="rounded border border-card-border bg-white dark:bg-background px-3 py-2"
              value={form.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Category</span>
            <input
              className="rounded border border-card-border bg-white dark:bg-background px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as CategoriesType })
              }
              placeholder="FOOD, RENT, etc."
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Type</span>
            <select
              className="rounded border border-card-border bg-white dark:bg-background px-3 py-2"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "INCOME" | "EXPENSE",
                })
              }
            >
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm text-muted-foreground">
              Amount (₹ in paise)
            </span>
            <input
              type="number"
              className="rounded border border-card-border bg-white dark:bg-background px-3 py-2"
              value={form.amountPaise}
              onChange={(e) =>
                setForm({ ...form, amountPaise: e.target.value })
              }
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={onSave}
            className={cn(
              "rounded-lg px-4 py-2 text-sm text-white shadow",
              "bg-theme hover:opacity-90 disabled:opacity-50"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
