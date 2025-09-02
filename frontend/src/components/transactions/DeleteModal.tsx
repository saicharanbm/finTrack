import { useDeleteTransactions } from "@/services/mutations";
import type { TransactionType } from "@/types";
import { formatDateDDMMYYYY } from "@/utils/helper";

export const DeleteModal: React.FC<{
  open: boolean;
  txn: TransactionType | null;
  onClose: () => void;
}> = ({ open, txn, onClose }) => {
  const { mutateAsync: remove, isPending } = useDeleteTransactions();

  if (!open || !txn) return null;

  const onDelete = async () => {
    await remove({ id: txn.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(96vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-background p-5 shadow-2xl">
        <h3 className="mb-2 text-xl font-semibold">Delete transaction?</h3>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. You are deleting <b>{txn.title}</b> on{" "}
          <b>{formatDateDDMMYYYY(txn.date)}</b>.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
