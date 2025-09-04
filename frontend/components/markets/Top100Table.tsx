"use client";

import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatCurrency,
  formatPrice,
  formatPct,
  formatSupply,
} from "@/lib/format";
import { getPctBadgeVariant } from "@/lib/colors";
import { Sparkline } from "./Sparkline";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change_1h: number;
  change_24h: number;
  change_7d: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  sparkline_7d: number[];
}

interface Top100TableProps {
  data: CoinData[];
}

const columnHelper = createColumnHelper<CoinData>();

export function Top100Table({ data }: Top100TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row, index) => index + 1, {
        id: "rank",
        header: "#",
        cell: (info) => (
          <div className="text-sm font-medium text-muted-foreground">
            {info.getValue()}
          </div>
        ),
        size: 60,
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (info) => {
          const coin = info.row.original;
          return (
            <div className="flex items-center space-x-3">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-coin.png";
                }}
              />
              <div>
                <div className="font-medium text-sm">{coin.name}</div>
                <div className="text-xs text-muted-foreground uppercase">
                  {coin.symbol}
                </div>
              </div>
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("price", {
        id: "price",
        header: "Price",
        cell: (info) => (
          <div className="text-sm font-medium">
            {formatPrice(info.getValue())}
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("change_1h", {
        id: "change_1h",
        header: "1h%",
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge variant={getPctBadgeVariant(value)} size="sm">
              {formatPct(value)}
            </Badge>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("change_24h", {
        id: "change_24h",
        header: "24h%",
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge variant={getPctBadgeVariant(value)} size="sm">
              {formatPct(value)}
            </Badge>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("change_7d", {
        id: "change_7d",
        header: "7d%",
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge variant={getPctBadgeVariant(value)} size="sm">
              {formatPct(value)}
            </Badge>
          );
        },
        size: 80,
      }),
      columnHelper.accessor("market_cap", {
        id: "market_cap",
        header: "Market Cap",
        cell: (info) => (
          <div className="text-sm font-medium">
            {formatCurrency(info.getValue())}
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("volume_24h", {
        id: "volume_24h",
        header: "Volume(24h)",
        cell: (info) => (
          <div className="text-sm font-medium">
            {formatCurrency(info.getValue())}
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("circulating_supply", {
        id: "circulating_supply",
        header: "Circ. Supply",
        cell: (info) => (
          <div className="text-sm font-medium">
            {formatSupply(info.getValue())}
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor("sparkline_7d", {
        id: "sparkline",
        header: "7d Chart",
        cell: (info) => <Sparkline data={info.getValue()} />,
        size: 100,
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <div
          className="overflow-x-auto overflow-y-auto"
          ref={tableContainerRef}
          style={{ height: "600px" }}
        >
          <table
            className="w-full"
            role="table"
            aria-label="Top 100 cryptocurrencies"
          >
            <thead className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center space-x-1 hover:text-foreground"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
