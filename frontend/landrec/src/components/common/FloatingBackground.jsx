export default function FloatingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute top-[8%] left-[6%] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-floatSlow" />
      <div className="absolute bottom-[10%] right-[8%] w-96 h-96 rounded-full bg-amia-400/20 blur-3xl animate-floatSlower" />
      <div className="absolute top-[40%] right-[20%] w-56 h-56 rounded-full bg-green-500/10 blur-3xl animate-floatSlow" />

      <svg className="absolute top-[15%] right-[12%] w-24 h-24 opacity-20 animate-floatSlow" viewBox="0 0 100 100" fill="none">
        <circle cx="20" cy="20" r="3" fill="#2F6FED" />
        <circle cx="80" cy="20" r="3" fill="#2F6FED" />
        <circle cx="20" cy="80" r="3" fill="#2F6FED" />
        <circle cx="80" cy="80" r="3" fill="#2F6FED" />
        <circle cx="50" cy="50" r="3" fill="#4FCB8F" />
        <line x1="20" y1="20" x2="50" y2="50" stroke="#2F6FED" strokeWidth="1" />
        <line x1="80" y1="20" x2="50" y2="50" stroke="#2F6FED" strokeWidth="1" />
        <line x1="20" y1="80" x2="50" y2="50" stroke="#2F6FED" strokeWidth="1" />
        <line x1="80" y1="80" x2="50" y2="50" stroke="#2F6FED" strokeWidth="1" />
      </svg>

      <svg className="absolute bottom-[18%] left-[15%] w-32 h-32 opacity-15 animate-floatSlower" viewBox="0 0 100 100" fill="none">
        <rect x="10" y="10" width="30" height="30" rx="6" stroke="#33A873" strokeWidth="1.5" />
        <rect x="60" y="60" width="30" height="30" rx="6" stroke="#33A873" strokeWidth="1.5" />
        <line x1="40" y1="25" x2="60" y2="75" stroke="#33A873" strokeWidth="1" />
      </svg>

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#1C2430 1px, transparent 1px), linear-gradient(90deg, #1C2430 1px, transparent 1px)",
        backgroundSize: "48px 48px"
      }} />
    </div>
  );
}