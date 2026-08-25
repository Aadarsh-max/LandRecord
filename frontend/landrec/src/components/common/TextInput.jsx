export default function TextInput({ label, id, icon, ...rest }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <div className="relative rounded-claySm bg-base-surface shadow-clayInset">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>}
        <input
          id={id}
          className={`w-full bg-transparent py-3 ${icon ? "pl-11" : "pl-4"} pr-4 text-ink-primary placeholder:text-ink-muted focus:outline-none`}
          {...rest}
        />
      </div>
    </div>
  );
}