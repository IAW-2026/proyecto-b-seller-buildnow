'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function StoreFilter({ stores, currentStoreId }: { stores: { id: string, name: string }[], currentStoreId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (value) {
      params.set('storeId', value);
    } else {
      params.delete('storeId');
    }

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentStoreId}
      onChange={handleStoreChange}
      className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 min-w-[200px]"
    >
      <option value="">Todos los Corralones</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  );
}
