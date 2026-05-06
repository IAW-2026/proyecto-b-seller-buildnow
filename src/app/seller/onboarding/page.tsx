'use client';

import { createStoreAction } from '../../actions/store.actions';
import { Store, MapPin, AlignLeft, ArrowRight, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-2xl shadow-orange-500/20 ring-1 ring-white/10">
            <Building2 size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Configura tu Corralón
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Completa los datos de tu negocio para empezar a recibir órdenes en BuildNow.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/80">
          <form 
            className="space-y-6" 
            action={(formData) => {
              setIsSubmitting(true);
              createStoreAction(formData).catch((err: Error) => {
                alert(err.message);
                setIsSubmitting(false);
              });
            }}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Nombre del Corralón <span className="text-orange-500">*</span>
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Store className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-xl border-0 bg-zinc-950/50 py-2.5 pl-10 pr-3 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder="Ej: Materiales El Constructor"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-zinc-300">
                Dirección Comercial <span className="text-orange-500">*</span>
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="block w-full rounded-xl border-0 bg-zinc-950/50 py-2.5 pl-10 pr-3 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder="Ej: Av. San Martín 1234, CABA"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
                Descripción <span className="text-zinc-500 font-normal">(Opcional)</span>
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute top-3 left-0 flex pl-3">
                  <AlignLeft className="h-5 w-5 text-zinc-500" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-xl border-0 bg-zinc-950/50 py-2.5 pl-10 pr-3 text-white ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition-all resize-none"
                  placeholder="Breve descripción de los materiales que ofreces..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-xl bg-orange-600 px-3 py-3 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <ArrowRight className="h-5 w-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
                </span>
                {isSubmitting ? 'Configurando tienda...' : 'Empezar a vender'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl mix-blend-screen"></div>
      </div>
    </div>
  );
}
