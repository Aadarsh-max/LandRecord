export default function ConfidenceBadge({ confidence }) {
  const percent = Math.round(confidence * 100);
  let tone = "bg-green-500/15 text-green-600";
  if (confidence < 0.7) tone = "bg-amia-500/15 text-amia-600";
  if (confidence < 0.5) tone = "bg-red-500/15 text-red-500";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {percent}%
    </span>
  );
}