import { CheckCircle, X } from 'lucide-react';

type ToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

const Toast = ({ message, actionLabel, onAction, onClose }: ToastProps) => (
  <div className="fixed bottom-5 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-lg border border-cream-300 bg-white p-4 text-cocoa-800 shadow-xl">
    <CheckCircle className="h-5 w-5 flex-none text-sage-600" aria-hidden="true" />
    <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
    {actionLabel && onAction && (
      <button type="button" className="text-sm font-bold text-rose-700 hover:text-rose-800" onClick={onAction}>
        {actionLabel}
      </button>
    )}
    <button type="button" className="rounded-full p-1 text-cocoa-400 hover:bg-cream-100 hover:text-cocoa-700" onClick={onClose}>
      <span className="sr-only">Zavrieť upozornenie</span>
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
);

export default Toast;
