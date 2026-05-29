import { Heart, X } from 'lucide-react';

type ToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

const Toast = ({ message, actionLabel, onAction, onClose }: ToastProps) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed bottom-6 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-cream-200 bg-white p-4 text-cocoa-800 shadow-xl"
  >
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" aria-hidden="true" />
    </span>
    <p className="min-w-0 flex-1 text-sm font-medium leading-5">{message}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        className="rounded-full px-3 py-1 text-sm font-bold text-rose-700 transition hover:bg-rose-50 hover:text-rose-800"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    )}
    <button
      type="button"
      className="rounded-full p-1 text-cocoa-400 hover:bg-cream-100 hover:text-cocoa-700"
      onClick={onClose}
    >
      <span className="sr-only">Zavrieť upozornenie</span>
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
);

export default Toast;
