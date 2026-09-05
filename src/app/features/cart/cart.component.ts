import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartStore } from '../../shared/stores/cart.store';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cartStore = inject(CartStore);

  readonly grandTotal = computed(() => {
    const delivery = this.cartStore.total() >= 999 ? 0 : 99;
    return this.cartStore.total() + delivery;
  });

  increaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current + 1);
  }

  decreaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current - 1);
  }

  removeItem(productId: string): void {
    this.cartStore.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartStore.clearCart();
  }
}
