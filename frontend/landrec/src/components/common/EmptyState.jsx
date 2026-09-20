import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, actionTo, onAction, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-clay bg-base-surfaceLight p-10 text-center shadow-clayInset sm:p-16">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 to-green-500/15">
        <div className="absolute inset-0 animate-pulseGlow rounded-full bg-gradient-to-br from-blue-500/10 to-green-500/10" />
        {Icon && <Icon className="relative h-8 w-8 text-blue-600" />}
      </div>
      <p className="text-lg font-medium text-ink-primary">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-md text-sm text-ink-secondary">{subtitle}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 rounded-claySm bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-claySm"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="mt-6 rounded-claySm bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-claySm"
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}