import { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

// ============================================================
// Toast Notification System
// ============================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

// Global toast state — simple pub/sub
type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function showToast(type: Toast['type'], message: string, duration = 3000) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  toasts = [...toasts, { id, type, message, duration }];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
}

export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

function ToastIcon({ type }: { type: Toast['type'] }) {
  switch (type) {
    case 'success': return <CheckCircle2 size={16} style={{ color: 'var(--status-green)' }} />;
    case 'error': return <AlertTriangle size={16} style={{ color: 'var(--status-red)' }} />;
    case 'info': return <Info size={16} style={{ color: 'var(--status-blue)' }} />;
  }
}

const TYPE_BORDER: Record<Toast['type'], string> = {
  success: 'var(--status-green)',
  error: 'var(--status-red)',
  info: 'var(--status-blue)',
};

export default function ToastContainer() {
  const [current, setCurrent] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (newToasts: Toast[]) => setCurrent(newToasts);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  if (current.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '380px',
    }}>
      {current.map(toast => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderLeft: `3px solid ${TYPE_BORDER[toast.type]}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.25s ease',
            color: 'var(--text-primary)',
            fontSize: '13px',
          }}
        >
          <ToastIcon type={toast.type} />
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: '2px', display: 'flex', flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
