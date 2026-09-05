// ============================================================
// GadgetPlanet — Wishlist Signal Store
// Writable-signal pattern compatible with @ngrx/signals migration
// ============================================================
import { computed, inject, Injectable, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CartStore } from './cart.store';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly cartStore = inject(CartStore);

  // ── State ──────────────────────────────────────────────────
  private readonly _items = signal<Product[]>([
    {
      id: 'p002',
      name: 'QuantumBoom 360',
      brand: 'BoomX',
      category: 'Speakers',
      price: 8999,
      discountPrice: 6499,
      discountPercent: 28,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
      ],
      rating: 4.7,
      reviewCount: 890,
      badges: ['Hot Deal', 'Bestseller'],
      description: '360° surround sound with 20W output and LED mood lighting.',
      specs: { 'Output': '20W RMS', 'Battery': '18H', 'Connectivity': 'Bluetooth 5.2 + AUX', 'IP Rating': 'IPX7' },
      inStock: true,
      stockCount: 45,
    },
    {
      id: 'p004',
      name: 'BassBuds Neo',
      brand: 'SoundCore',
      category: 'Earphones',
      price: 2499,
      discountPrice: 1699,
      discountPercent: 32,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
      ],
      rating: 4.3,
      reviewCount: 3120,
      badges: ['Top Rated'],
      description: 'Lightweight everyday earphones with punchy bass and touch controls.',
      specs: { 'Driver': '10mm Dynamic', 'Battery': '24H (case)', 'Connectivity': 'Bluetooth 5.3', 'Latency': '50ms' },
      inStock: true,
      stockCount: 200,
    },
  ]);

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

  moveToCart(product: Product): void {
    this.cartStore.addToCart(product);
    this.removeFromWishlist(product.id);
  }

  moveAllToCart(): void {
    const current = this._items();
    for (const item of current) {
      this.cartStore.addToCart(item);
    }
    this.clearWishlist();
  }

  clearWishlist(): void {
    this._items.set([]);
  }
}
