const variantStyles = {
  primary: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-clay hover:shadow-claySm",
  secondary: "bg-gradient-to-br from-amia-500 to-green-500 text-white shadow-clay hover:shadow-claySm",
  ghost: "bg-base-surface text-ink-primary shadow-clay hover:shadow-clayInset"
};

export default function Button({ children, variant = "primary", fullWidth, className = "", ...rest }) {
  return (
    <button
      className={`relative overflow-hidden rounded-claySm px-6 py-3 font-medium tracking-wide
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] 
        ${fullWidth ? "w-full" : ""}
        ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 transition-transform duration-500 ease-out group-hover:translate-x-full" />
    </button>
  );
}