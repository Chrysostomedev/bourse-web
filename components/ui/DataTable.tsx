"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import Paginate from "./Paginate";

export type ColumnConfig<T> = {
  header: string;
  key: keyof T | "actions";
  render?: (value: any, item: T) => React.ReactNode;
  mobileHide?: boolean;
  mobilePrimary?: boolean;
  mobileBadge?: boolean;
};

type Props<T> = {
  title: string;
  columns: ColumnConfig<T>[];
  data: T[];
  onViewAll?: () => void;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
};

/**
 * Nettoie le HTML et rend email/téléphone cliquables.
 */
function renderCellValue(value: any): React.ReactNode {
  if (value == null || value === "") return "-";

  const str = String(value);

  if (/<[a-z][\s\S]*>/i.test(str)) {
    const stripped = str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    if (!stripped) return "-";

    return (
      <div
        className="prose prose-sm max-w-none text-slate-700 line-clamp-2 text-xs leading-relaxed [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_s]:line-through"
        dangerouslySetInnerHTML={{ __html: str }}
      />
    );
  }

  const text = str.trim();

  if (!text) return "-";

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return (
      <a
        href={`mailto:${text}`}
        onClick={(e) => e.stopPropagation()}
        className="text-slate-700 hover:text-slate-900 hover:underline transition-colors"
      >
        {text}
      </a>
    );
  }

  if (/^[+\d][\d\s\-().]{6,}$/.test(text)) {
    return (
      <a
        href={`tel:${text.replace(/\s/g, "")}`}
        onClick={(e) => e.stopPropagation()}
        className="text-slate-700 hover:text-slate-900 hover:underline transition-colors"
      >
        {text}
      </a>
    );
  }

  return text;
}

export default function DataTable<T extends { id: string | number }>({
  title,
  columns = [],
  data = [],
  isLoading = false,
  pagination,
}: Props<T>) {
  const { t } = useLanguage();

  return (
    <div className="bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {title}
          </h2>

          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <table className="min-w-full border-separate border-spacing-y-0">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col, index) => (
                <th
                  key={String(col.key)}
                  className={`py-4 px-4 text-left text-[13px] font-black tracking-wider text-black bg-gray-200 ${
                    index === 0 ? "rounded-l-2xl" : ""
                  } ${
                    index === columns.length - 1 ? "rounded-r-2xl" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-slate-50/50"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="py-5 px-4 text-sm font-bold text-slate-600"
                    >
                      {col.render
                        ? col.render(
                            col.key !== "actions"
                              ? item[col.key as keyof T]
                              : undefined,
                            item
                          )
                        : col.key !== "actions"
                        ? renderCellValue(item[col.key as keyof T])
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm italic text-slate-400"
                >
                  {isLoading ? t("common.loading") : t("table.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center border-t border-slate-50 bg-slate-50/30 p-6">
          <Paginate
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}