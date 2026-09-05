// ============================================================
// GadgetPlanet — Cart Signal Store
// Writable-signal pattern compatible with @ngrx/signals migration
// ============================================================
import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class CartStore {
  // ── State ──────────────────────────────────────────────────
  private readonly _items = signal<CartItem[]>([]);

  // ── Selectors (public, readonly) ───────────────────────────
  readonly items = this._items.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this._items().reduce((sum, item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      return sum + unitPrice * item.quantity;
    }, 0)
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  readonly itemCount = computed(() => this._items().length);

  // ── Actions ────────────────────────────────────────────────
  addToCart(product: Product, qty = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...items, { product, quantity: qty }];
    });
  }

  removeFromCart(productId: string): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQty(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.update(items =>
      items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  clearCart(): void {
    this._items.set([]);
  }

  isInCart(productId: string): boolean {
    return this._items().some(i => i.product.id === productId);
  }

  getItem(productId: string): CartItem | undefined {
    return this._items().find(i => i.product.id === productId);
  }
}
