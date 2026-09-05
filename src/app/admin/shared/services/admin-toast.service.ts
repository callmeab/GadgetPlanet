import { Injectable, signal } from '@angular/core';

export interface AdminToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminToastService {
  private readonly _toasts = signal<AdminToast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<AdminToast, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duration = toast.duration ?? 3500;
    const newToast: AdminToast = { ...toast, id, duration };

    this._toasts.update(list => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(message: string, title?: string): string {
    return this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): string {
    return this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): string {
    return this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): string {
    return this.show({ type: 'info', message, title });
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clearAll(): void {
    this._toasts.set([]);
  }
}
