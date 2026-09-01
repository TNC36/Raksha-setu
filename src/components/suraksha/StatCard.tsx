import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
}

export default function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: accent || "#f5f5f5" }}
      >
        <Icon className="w-5 h-5 text-neutral-800" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-neutral-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-neutral-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
