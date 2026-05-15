'use client';

import { useState, useTransition } from 'react';
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from '@/app/actions/category.actions';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { Trash2, Loader2, PlusCircle, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function CategoryCreateForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await createCategoryAction(formData);
        form.reset();
        toast.success('Categoría creada con éxito');
      } catch (err: any) {
        toast.error(err.message || 'Error al crear la categoría');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 w-full relative">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la Categoría</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="Ej: Materiales Gruesos" 
          required
          disabled={isPending}
          className="block w-full rounded-md border-0 px-3 py-2 pl-4 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
        />
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteCategoryAction(id);
        toast.success('Categoría eliminada con éxito');
        setIsModalOpen(false);
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar la categoría');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
        title="Eliminar categoría"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      </button>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        isLoading={isPending}
      />
    </>
  );
}

export function CategoryTableRow({ category }: { category: { id: string, name: string, createdAt: Date } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateCategoryAction(category.id, formData);
        setIsEditing(false);
        toast.success('Categoría actualizada con éxito');
      } catch (err: any) {
        toast.error(err.message || 'Error al actualizar la categoría');
      }
    });
  };

  if (isEditing) {
    return (
      <tr className="bg-zinc-50 border-y border-orange-200">
        <td colSpan={3} className="px-6 py-3">
          <form onSubmit={handleUpdate} className="flex items-center gap-3 w-full">
            <input 
              type="text" 
              name="name" 
              defaultValue={category.name} 
              autoFocus
              disabled={isPending}
              className="block flex-1 rounded-md border-0 px-3 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-orange-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
              required 
            />
            <button 
              type="submit" 
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-md p-2 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Guardar"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-md p-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              title="Cancelar"
            >
              <X size={18} />
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-6 py-4 font-medium text-zinc-900">{category.name}</td>
      <td className="px-6 py-4 text-sm text-zinc-500">
        {new Date(category.createdAt).toLocaleDateString('es-AR')}
      </td>
      <td className="px-6 py-4 flex flex-row items-center justify-end gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          title="Editar categoría"
        >
          <Edit2 size={18} />
        </button>
        <CategoryDeleteButton id={category.id} />
      </td>
    </tr>
  );
}