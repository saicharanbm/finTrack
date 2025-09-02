import React from "react";
import { Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTransactionsQuery } from "@/services/queries";
import type { TransactionType } from "@/types";
import { EditModal } from "./EditModel";
import { formatDateDDMMYYYY } from "@/utils/helper";
import { Pill } from "./Pill";
import { DeleteModal } from "./DeleteModal";
import { AmountCell } from "./AmountCell";

type RangeKey = "week" | "month" | "3month" | "year" | "all";

type GetResp = {
  range: RangeKey | "all";
  page: number;
  pageSize: number;
  total: number;
  items: TransactionType[];
};

const ranges: { key: RangeKey; label: string }[] = [
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "3month", label: "Last 3 months" },
  { key: "year", label: "Last year" },
  { key: "all", label: "All time" },
];

const PAGE_SIZE = 5;

export default function Transactions() {
  const [range, setRange] = React.useState<RangeKey>("month");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError } = useTransactionsQuery({
    range,
    page,
    pageSize: PAGE_SIZE,
  });

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<TransactionType | null>(null);

  const totalPages = React.useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1),
    [data]
  );

  return (
    <div className="p-4 sm:p-6  overflow-y-auto">
      {/* header + range filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex flex-wrap items-center gap-2">
          {ranges.map((r) => (
            <Pill
              key={r.key}
              active={range === r.key}
              onClick={() => {
                setRange(r.key);
                setPage(1);
              }}
            >
              {r.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-scroll rounded-2xl border bg-white shadow-sm border-slate-200 dark:bg-[#0f172a] dark:border-white/10 dark:shadow-none">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-100 dark:bg-white/5">
            <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
              <th className="px-4 py-3 w-36">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 w-40">Category</th>
              <th className="px-4 py-3 w-28">Type</th>
              <th className="px-4 py-3 w-40">Amount</th>
              <th className="px-4 py-3 w-40">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-rose-500"
                >
                  Failed to load transactions.
                </td>
              </tr>
            )}
            {data && (data as GetResp).items.length === 0 && !isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions found.
                </td>
              </tr>
            )}

            {(data as GetResp)?.items?.map((t) => (
              <tr
                key={t.id}
                className="
            text-sm text-gray-700 dark:text-gray-200
            odd:bg-white even:bg-slate-50 hover:bg-slate-100/60
            dark:odd:bg-transparent dark:even:bg-transparent dark:hover:bg-transparent
          "
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateDDMMYYYY(t.date)}
                </td>
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3">{t.type}</td>
                <td className="px-4 py-3">
                  <AmountCell type={t.type} paise={Number(t.amountPaise)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelected(t);
                        setEditOpen(true);
                      }}
                      className="
                  inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs
                  border-slate-200 hover:bg-slate-50
                  dark:border-card-border dark:hover:bg-white/10
                "
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelected(t);
                        setDeleteOpen(true);
                      }}
                      className="
                  inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs
                  border-red-200 bg-red-50 text-red-700 hover:bg-red-100
                  dark:border-red-300/30 dark:bg-red-50/10 dark:text-red-400 dark:hover:bg-red-500/10
                "
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 text-sm border-t border-slate-200 dark:border-0">
          <div className="text-muted-foreground">
            Page <b>{(data as GetResp)?.page ?? page}</b> of <b>{totalPages}</b>{" "}
            • <b>{(data as GetResp)?.total ?? 0}</b> records
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="
          inline-flex items-center gap-1 rounded-md border px-3 py-1.5
          border-slate-200 hover:bg-slate-50 disabled:opacity-40
          dark:border-card-border dark:hover:bg-white/10
        "
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="
          inline-flex items-center gap-1 rounded-md border px-3 py-1.5
          border-slate-200 hover:bg-slate-50 disabled:opacity-40
          dark:border-card-border dark:hover:bg-white/10
        "
              title="Next"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditModal
        open={editOpen}
        txn={selected}
        onClose={() => setEditOpen(false)}
      />
      <DeleteModal
        open={deleteOpen}
        txn={selected}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
