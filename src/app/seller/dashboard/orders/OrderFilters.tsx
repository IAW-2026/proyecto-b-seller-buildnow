'use client';

import { Filter } from 'lucide-react';
import { FILTER_TABS } from './order.constants';

interface OrderFiltersProps {
  activeStatus: string;
  onFilterChange: (status: string) => void;
}

export function OrderFilters({ activeStatus, onFilterChange }: OrderFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-zinc-500" />
        <span className="text-sm text-zinc-500 font-medium">Filtrar por estado</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${isActive
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
