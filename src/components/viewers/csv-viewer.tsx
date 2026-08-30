"use client";

import * as React from "react";
import { parseCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

export interface CsvViewerProps {
  content: string;
  wrap: boolean;
  lineNumbers: boolean;
}

const CsvBody = React.memo(function CsvBody({ content, lineNumbers }: CsvViewerProps) {
  const rows = React.useMemo(() => parseCsv(content), [content]);
  const [header, ...body] = rows;

  /** Numeric columns are right-aligned — reads like a forensic report. */
  const numeric = React.useMemo(() => {
    if (!header) return [] as boolean[];
    return header.map((_, col) =>
      body.slice(0, 20).every((r) => {
        const v = r[col];
        return v === undefined || v === "" || /^-?\d+(\.\d+)?$/.test(v);
      }),
    );
  }, [header, body]);

  if (!header) {
    return <p className="p-6 font-mono text-[12px] text-parchment-500">No tabular data.</p>;
  }

  return (
    <div className="w-max min-w-full pb-16">
      <table className="w-full border-collapse font-mono text-[12.5px]">
        <thead>
          <tr>
            {lineNumbers && (
              <th className="sticky left-0 z-10 w-10 border-b border-r border-parchment-500/15 bg-ink-880 px-3 py-2.5 text-right text-[10px] font-medium uppercase tracking-widest2 text-parchment-700">
                #
              </th>
            )}
            {header.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "sticky top-0 z-10 whitespace-nowrap border-b border-parchment-500/15 bg-ink-880 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest2 text-parchment-400",
                  numeric[i] && "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} data-line className="group/row transition-colors hover:bg-parchment-100/[0.025]">
              {lineNumbers && (
                <td className="border-b border-r border-parchment-500/10 px-3 py-2 text-right tabular text-parchment-700">
                  {ri + 1}
                </td>
              )}
              {header.map((_, ci) => {
                const value = row[ci] ?? "";
                return (
                  <td
                    key={ci}
                    className={cn(
                      "max-w-[420px] whitespace-nowrap border-b border-parchment-500/10 px-4 py-2 text-parchment-300",
                      numeric[ci] && "text-right tabular text-parchment-200",
                    )}
                  >
                    {value === "" ? (
                      <span className="text-parchment-700">—</span>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export function CsvViewer(props: CsvViewerProps) {
  return <CsvBody {...props} />;
}
