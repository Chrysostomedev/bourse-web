"use client";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

interface DonutCardProps {
  title: string;
  segments: DonutSegment[];
  children?: React.ReactNode;
}

export default function DonutCard({
  title,
  segments,
  children,
}: DonutCardProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">{segment.label}</span>
              <span className="text-xs font-bold text-slate-900">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={segment.color}
                style={{ width: `${(segment.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
