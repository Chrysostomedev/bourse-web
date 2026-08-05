"use client";

interface DonutCardProps {
  title: string;
  value: number;
  percentage?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function DonutCard({
  title,
  value,
  percentage,
  color = "bg-blue-500",
  children,
}: DonutCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
          {percentage !== undefined && (
            <p className="text-sm text-slate-400 mt-2">{percentage}% du total</p>
          )}
        </div>
        {children && (
          <div className="flex-1 ml-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
