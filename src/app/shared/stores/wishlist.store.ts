// ============================================================
// GadgetPlanet — Wishlist Signal Store
// Writable-signal pattern compatible with @ngrx/signals migration
// ============================================================
import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  // ── State ──────────────────────────────────────────────────
  private readonly _items = signal<Product[]>([]);

  // ── Selectors ──────────────────────────────────────────────
  readonly items = this._items.asReadonly();

  readonly count = computed(() => this._items().length);

  readonly isEmpty = computed(() => this._items().length === 0);

  /** Set of product IDs for O(1) membership checks */
  private readonly _wishlistIds = computed(
    () => new Set(this._items().map(p => p.id))
  );

  isInWishlist(productId: string): boolean {
    return this._wishlistIds().has(productId);
  }

  // ── Actions ────────────────────────────────────────────────
  addToWishlist(product: Product): void {
    if (!this.isInWishlist(product.id)) {
      this._items.update(items => [...items, product]);
    }
  }

  removeFromWishlist(productId: string): void {
    this._items.update(items => items.filter(p => p.id !== productId));
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }

  clearWishlist(): void {
    this._items.set([]);
  }
}
