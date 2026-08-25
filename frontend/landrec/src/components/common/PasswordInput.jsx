import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({ label, id, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <div className="relative rounded-claySm bg-base-surface shadow-clayInset">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="w-full bg-transparent py-3 pl-11 pr-11 text-ink-primary placeholder:text-ink-muted focus:outline-none"
          {...rest}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-blue-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}