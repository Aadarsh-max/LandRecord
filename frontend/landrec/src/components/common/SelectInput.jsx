export default function SelectInput({ label, id, icon, options, ...rest }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <div className="relative rounded-claySm bg-base-surface shadow-clayInset">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>}
        <select
          id={id}
          className={`w-full appearance-none bg-transparent py-3 ${icon ? "pl-11" : "pl-4"} pr-10 text-ink-primary focus:outline-none`}
          {...rest}
        >
          <option value="" disabled>Select a department</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}