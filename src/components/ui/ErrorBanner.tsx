import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  title?: string;
}

export function ErrorBanner({ message, title = 'Atención' }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm mt-1 opacity-90">{message}</p>
      </div>
    </div>
  );
}
