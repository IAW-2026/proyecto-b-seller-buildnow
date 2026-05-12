'use client';

import { useState, useTransition } from 'react';
import { createCategoryAction, deleteCategoryAction } from '@/app/actions/category.actions';
import { Trash2, Loader2, PlusCircle } from 'lucide-react';

export function CategoryCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await createCategoryAction(formData);
        form.reset();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 w-full">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la Categoría</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="Ej: Materiales Gruesos" 
          required
          disabled={isPending}
          className="block w-full rounded-md border-0 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
        Crear Categoría
      </button>
    </form>
  );
}

export function CategoryDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('¿Estás seguro que deseas borrar esta categoría?')) return;
    
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
      title="Eliminar categoría"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}