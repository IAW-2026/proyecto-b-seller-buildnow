import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { CategoryCreateForm, CategoryTableRow } from './CategoryClient';
import { Tags } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export default async function AdminCategoriesPage() {

  const categoryRepo = new PrismaCategoryRepository();
  const categoriesResult = await categoryRepo.findAll();
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const hasError = !categoriesResult.success;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Categorías Globales</h2>
        <p className="text-zinc-500 mt-1">
          Las categorías que crees aquí estarán disponibles para que todos los corralones puedan clasificar sus productos.
        </p>
      </div>

      <CategoryCreateForm />

      {hasError && (
        <ErrorBanner 
          title="Atención" 
          message="No se pudo cargar la lista de categorías actuales debido a un problema de conexión. La tabla se mostrará vacía temporalmente." 
        />
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden mt-8">
        {categories.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mb-4">
              <Tags className="text-zinc-400" size={32} />
            </div>
            <h4 className="text-zinc-900 font-medium">No hay categorías configuradas</h4>
            <p className="text-zinc-500 mt-1 text-sm">Comienza creando al menos una categoría arriba.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Fecha Alta</th>
                <th className="px-6 py-4 font-medium text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categories.map((category) => (
                <CategoryTableRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}