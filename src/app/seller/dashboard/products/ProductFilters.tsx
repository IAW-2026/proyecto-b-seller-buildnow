'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Category } from '@prisma/client';

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: { search?: string; categoryId?: string }) => void;
  isSearching: boolean;
}

export function ProductFilters({ categories, onFilterChange, isSearching }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        search: searchTerm.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onFilterChange({
      search: searchTerm.trim() || undefined,
      categoryId: categoryId || undefined,
    });
  }, [searchTerm, onFilterChange]);

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategoryId !== '';

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategoryId('');
    onFilterChange({ search: undefined, categoryId: undefined });
  }, [onFilterChange]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-sm"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Selector de categoría */}
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full sm:w-56 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-sm appearance-none cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Limpiar filtros"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
