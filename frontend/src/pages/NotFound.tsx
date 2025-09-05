import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchX, ChevronLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6 bg-background ">
      <div className="w-full max-w-xl text-center space-y-6">
        {/* Icon badge */}
        <div
          className="mx-auto inline-flex items-center justify-center rounded-2xl border bg-white shadow-sm size-16
                        border-slate-200
                        dark:bg-card-background dark:border-card-border"
        >
          <SearchX className="h-8 w-8 text-slate-600 dark:text-gray-300" />
        </div>

        {/* Title */}
        <div>
          <div className="text-5xl font-bold leading-none text-title">404</div>
          <p className="mt-2 text-slate-600 dark:text-gray-400">
            We couldn’t find <span className="font-mono">{pathname}</span>.
          </p>
        </div>

        {/* Card with quick actions */}
        <div
          className="mx-auto w-full rounded-2xl border bg-white p-4 shadow-sm
                        border-slate-200
                        dark:bg-card-background dark:border-card-border"
        >
          <p className="text-sm text-slate-600 dark:text-gray-400">
            The page may have moved or no longer exists. Try going back or jump
            to a section:
          </p>

          {/* Quick links */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              to="/dashboard"
              className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50
                         border-slate-200
                         dark:text-gray-300 dark:hover:bg-white/10 dark:border-card-border"
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50
                         border-slate-200
                         dark:text-gray-300 dark:hover:bg-white/10 dark:border-card-border"
            >
              Analytics
            </Link>
            <Link
              to="/transactions"
              className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50
                         border-slate-200
                         dark:text-gray-300 dark:hover:bg-white/10 dark:border-card-border"
            >
              Transactions
            </Link>
            <Link
              to="/add"
              className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50
                         border-slate-200
                         dark:text-gray-300 dark:hover:bg-white/10 dark:border-card-border"
            >
              Add Transaction
            </Link>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-slate-700 hover:bg-slate-50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40
                         border-slate-300
                         dark:text-gray-300 dark:hover:bg-gray-800 dark:border-card-border"
            >
              <ChevronLeft className="h-4 w-4" />
              Go back
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#1566e7] px-4 py-2 text-white shadow-input
                         hover:bg-[#125ad0]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1566e7]/40"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
