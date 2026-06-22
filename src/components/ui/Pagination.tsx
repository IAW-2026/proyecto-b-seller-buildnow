'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const buttonClasses = "inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
      <p className="text-sm text-zinc-500 hidden sm:block">
        Mostrando <span className="font-medium text-zinc-700">{start}–{end}</span> de{' '}
        <span className="font-medium text-zinc-700">{total}</span>
      </p>
      
      <div className="flex items-center gap-2">
        {onPageChange ? (
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={prevDisabled}
            className={buttonClasses}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        ) : (
          <Link
            href={prevDisabled ? '#' : createPageUrl(page - 1)}
            className={`${buttonClasses} ${prevDisabled ? 'opacity-40 pointer-events-none' : ''}`}
            scroll={false}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Link>
        )}

        <span className="text-sm text-zinc-500 px-2">
          Página {page} de {totalPages}
        </span>

        {onPageChange ? (
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={nextDisabled}
            className={buttonClasses}
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={nextDisabled ? '#' : createPageUrl(page + 1)}
            className={`${buttonClasses} ${nextDisabled ? 'opacity-40 pointer-events-none' : ''}`}
            scroll={false}
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
