import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../../core/models/product.model';

export interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  // ── State ──────────────────────────────────────────────────
  private readonly _items = signal<CartItem[]>([
    {
      product: {
        id: 'p001',
        name: 'AirBass Pro X1',
        brand: 'SoundCore',
        category: 'Earphones',
        price: 3999,
        discountPrice: 2499,
        discountPercent: 38,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
        ],
        rating: 4.5,
        reviewCount: 2341,
        badges: ['Bestseller'],
        description: 'Deep bass, 30-hour battery, IPX5 water-resistant true wireless earphones.',
        specs: { 'Driver': '13mm Dynamic', 'Battery': '30H' },
        inStock: true,
        stockCount: 120,
      },
      quantity: 1,
      variant: 'Obsidian Black',
    },
    {
      product: {
        id: 'p003',
        name: 'VortexWatch Ultra',
        brand: 'TechWear',
        category: 'Smartwatches',
        price: 14999,
        discountPrice: 10999,
        discountPercent: 27,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        ],
        rating: 4.8,
        reviewCount: 1540,
        badges: ['Bestseller'],
        description: '1.96" AMOLED display, BT calling, 100+ sports modes, 7-day battery life.',
        specs: { 'Display': '1.96" AMOLED', 'Battery': '7 Days' },
        inStock: true,
        stockCount: 65,
      },
      quantity: 1,
      variant: 'Electric Blue',
    },
  ]);

  // Mini Cart Drawer UI Signal
  readonly isDrawerOpen = signal<boolean>(false);

  // Undo Snackbar State
  readonly lastRemovedItem = signal<CartItem | null>(null);
  readonly showUndoSnackbar = signal<boolean>(false);
  private undoTimer: any = null;

  // Coupon State
  readonly appliedCoupon = signal<AppliedCoupon | null>(null);
  readonly couponError = signal<string | null>(null);

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

  // Free shipping threshold: Rs. 999
  readonly shippingFee = computed(() => {
    const t = this.total();
    return t >= 999 || t === 0 ? 0 : 99;
  });

  readonly freeShippingRemaining = computed(() => Math.max(0, 999 - this.total()));
  readonly freeShippingPercent = computed(() =>
    Math.min(100, Math.round((this.total() / 999) * 100))
  );

  readonly discountAmount = computed(() => this.appliedCoupon()?.discount ?? 0);

  readonly grandTotal = computed(() =>
    Math.max(0, this.total() + this.shippingFee() - this.discountAmount())
  );

  // ── Actions ────────────────────────────────────────────────
  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(v => !v);
  }

  addToCart(product: Product, qty = 1, variant = 'Obsidian Black'): void {
    this._items.update(items => {
      const existing = items.find(
        i => i.product.id === product.id && i.variant === variant
      );
      if (existing) {
        return items.map(i =>
          i.product.id === product.id && i.variant === variant
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...items, { product, quantity: qty, variant }];
    });
  }

  removeFromCart(productId: string): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  removeFromCartWithUndo(productId: string): void {
    const itemToRemove = this._items().find(i => i.product.id === productId);
    if (itemToRemove) {
      this.lastRemovedItem.set(itemToRemove);
      this.showUndoSnackbar.set(true);

      if (this.undoTimer) {
        clearTimeout(this.undoTimer);
      }
      this.undoTimer = setTimeout(() => {
        this.showUndoSnackbar.set(false);
        this.lastRemovedItem.set(null);
      }, 5500);
    }
    this.removeFromCart(productId);
  }

  undoRemove(): void {
    const item = this.lastRemovedItem();
    if (item) {
      this._items.update(items => [...items, item]);
      this.showUndoSnackbar.set(false);
      this.lastRemovedItem.set(null);
      if (this.undoTimer) {
        clearTimeout(this.undoTimer);
      }
    }
  }

  updateQty(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCartWithUndo(productId);
      return;
    }
    this._items.update(items =>
      items.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }

  clearCart(): void {
    this._items.set([]);
    this.appliedCoupon.set(null);
  }

  isInCart(productId: string): boolean {
    return this._items().some(i => i.product.id === productId);
  }

  getItem(productId: string): CartItem | undefined {
    return this._items().find(i => i.product.id === productId);
  }

  applyCoupon(rawCode: string): boolean {
    const code = rawCode.trim().toUpperCase();
    this.couponError.set(null);

    if (!code) {
      this.couponError.set('Please enter a coupon code.');
      return false;
    }

    if (code === 'PLANETVIP500') {
      this.appliedCoupon.set({
        code: 'PLANETVIP500',
        discount: 500,
        label: 'VIP Welcome Voucher (Rs. 500 OFF)',
      });
      return true;
    }

    if (code === 'GADGET10' || code === 'FLASH10') {
      const disc = Math.round(this.total() * 0.1);
      this.appliedCoupon.set({
        code,
        discount: disc,
        label: '10% Flash Discount Voucher',
      });
      return true;
    }

    this.couponError.set('Invalid or expired coupon code. Try PLANETVIP500.');
    return false;
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponError.set(null);
  }
}
