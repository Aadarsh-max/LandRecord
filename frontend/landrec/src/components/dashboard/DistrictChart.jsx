import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function DistrictChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-claySm bg-base-surface shadow-clayInset">
        <p className="text-sm text-ink-muted">No district data yet — upload a document to see this chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5B6472" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#5B6472" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Bar dataKey="count" fill="#2F6FED" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}