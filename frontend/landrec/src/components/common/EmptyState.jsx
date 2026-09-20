import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-clay bg-base-surfaceLight p-10 text-center shadow-clayInset sm:p-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 to-green-500/15">
        {Icon && <Icon className="h-7 w-7 text-blue-600" />}
      </div>
      <p className="text-base font-medium text-ink-primary">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{subtitle}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 rounded-claySm bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-claySm"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="mt-5 rounded-claySm bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-claySm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}