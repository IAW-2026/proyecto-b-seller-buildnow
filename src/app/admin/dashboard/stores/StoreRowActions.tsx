'use client';

import { useTransition } from 'react';
import { toggleStoreSuspensionAction } from '@/app/actions/admin.actions';
import { StoreStatus } from '@prisma/client';
import Link from 'next/link';
import { Eye, ShieldAlert, CheckCircle } from 'lucide-react';

export function StoreRowActions({ storeId, status }: { storeId: string, status: StoreStatus }) {
  const [isPending, startTransition] = useTransition();
  const isSuspended = status === StoreStatus.SUSPENDED;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStoreSuspensionAction(storeId, !isSuspended);
      } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("Hubo un error al cambiar el estado de la tienda");
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Link 
        href={`/admin/dashboard/stores/${storeId}`} 
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
      >
        <Eye size={16} />
        Ver detalle
      </Link>
      
      <button 
        onClick={handleToggle} 
        disabled={isPending}
        className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
          isSuspended 
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200' 
            : 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPending ? 'Procesando...' : isSuspended ? (
          <><CheckCircle size={16} /> Reactivar</>
        ) : (
          <><ShieldAlert size={16} /> Suspender</>
        )}
      </button>
    </div>
  );
}