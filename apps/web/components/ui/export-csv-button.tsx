"use client";

import { Download } from "lucide-react";
import { downloadTextFile, rowsToCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

type CsvRow = (string | number | boolean | null | undefined)[];

export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Export",
  className,
}: {
  filename: string;
  headers: string[];
  rows: CsvRow[];
  label?: string;
  className?: string;
}) {
  const onExport = () => {
    const csv = rowsToCsv(headers, rows);
    downloadTextFile(filename, csv);
  };

  return (
    <button
      type="button"
      onClick={onExport}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600/70 transition-all duration-300 backdrop-blur-sm group",
        className
      )}
    >
      <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
      {label}
    </button>
  );
}
