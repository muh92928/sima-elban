"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps<T> {
  table: Table<T>;
}

export default function TablePagination<T>({ table }: TablePaginationProps<T>) {
  return (
    <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20 print:hidden">
      <div className="flex items-center gap-2 text-xs text-slate-400">
         <span>
             Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
         </span>
         <span className="hidden sm:inline text-slate-600">|</span>
         <span className="hidden sm:inline">
             Total {table.getFilteredRowModel().rows.length} Data
         </span>
      </div>
      
      <div className="flex items-center gap-1">
          <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
              title="Awal"
          >
              <ChevronsLeft size={16} />
          </button>
          <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
              title="Sebelumnya"
          >
              <ChevronLeft size={16} />
          </button>
          
          <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
              title="Selanjutnya"
          >
              <ChevronRight size={16} />
          </button>
          <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-colors"
              title="Akhir"
          >
              <ChevronsRight size={16} />
          </button>
      </div>
    </div>
  );
}
