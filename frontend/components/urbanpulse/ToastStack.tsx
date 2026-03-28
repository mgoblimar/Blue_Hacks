import { ToastNotice } from "./types";

type ToastStackProps = {
  toasts: ToastNotice[];
  onDismiss: (id: string) => void;
};

const ICONS: Record<ToastNotice["variant"], string> = {
  danger: "🚨",
  warn: "⚠️",
  info: "💡",
  success: "✅",
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.variant}`}>
          <span className="toast-icon">{ICONS[toast.variant]}</span>
          <div className="toast-body">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-msg">{toast.message}</div>
            {toast.rule ? <div className="toast-rule">IFTTT: {toast.rule}</div> : null}
          </div>
          <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)}>
            ×
          </button>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
