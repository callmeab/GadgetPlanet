import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartStore } from '../../shared/stores/cart.store';
import { MockDataService } from '../../core/services/mock-data.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCarouselSectionComponent } from '../../shared/components/product-carousel-section/product-carousel-section.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, ProductCarouselSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cartStore = inject(CartStore);
  private readonly mockData = inject(MockDataService);
  private readonly router = inject(Router);

  readonly couponInput = signal<string>('');
  readonly isApplyingCoupon = signal<boolean>(false);
  readonly checkoutSuccess = signal<boolean>(false);

  // Upsell recommendations
  readonly upsellProducts = computed<Product[]>(() => {
    return this.mockData.getFeaturedProducts(8);
  });

  // Available coupon presets
  readonly couponPresets = [
    { code: 'PLANETVIP500', label: 'Rs. 500 OFF on Orders > Rs. 1,000' },
    { code: 'FLASH10', label: '10% OFF Site-Wide' },
  ];

  increaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current + 1);
  }

  decreaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current - 1);
  }

  removeItem(productId: string): void {
    this.cartStore.removeFromCartWithUndo(productId);
  }

  undoRemove(): void {
    this.cartStore.undoRemove();
  }

  onCouponInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.couponInput.set(target.value);
  }

  applyCouponCode(codeToApply?: string): void {
    const code = codeToApply || this.couponInput();
    if (!code) return;

    this.isApplyingCoupon.set(true);
    setTimeout(() => {
      this.isApplyingCoupon.set(false);
      const success = this.cartStore.applyCoupon(code);
      if (success) {
        this.couponInput.set('');
      }
    }, 350);
  }

  removeCoupon(): void {
    this.cartStore.removeCoupon();
  }

  clearCart(): void {
    this.cartStore.clearCart();
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
