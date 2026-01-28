import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  toasts = signal<ToastMessage[]>([]);

  show(text: string, type: ToastType = 'info', ttlMs = 5000) {
    const id = `${Date.now()}-${this.counter++}`;
    const msg: ToastMessage = { id, type, text };
    this.toasts.set([...this.toasts(), msg]);

    window.setTimeout(() => this.dismiss(id), ttlMs);
  }

  dismiss(id: string) {
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
  }
}
