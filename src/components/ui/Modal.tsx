'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'dark' | 'light';
}

export function Modal({ isOpen, onClose, title, children, variant = 'dark' }: ModalProps) {
  if (!isOpen) return null;

  const isLight = variant === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className={`relative w-full max-w-md p-6 mx-4 rounded-xl shadow-2xl ${
        isLight
          ? 'bg-white border border-zinc-200'
          : 'bg-zinc-900 border border-zinc-800'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-xl font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`transition-colors ${isLight ? 'text-zinc-400 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
