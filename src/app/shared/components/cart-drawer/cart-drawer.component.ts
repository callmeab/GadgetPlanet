import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartStore } from '../../stores/cart.store';

@Component({
  selector: 'gp-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
})
export class CartDrawerComponent {
  readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  close(): void {
    this.cartStore.closeDrawer();
  }

  increaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current + 1);
  }

  decreaseQty(productId: string, current: number): void {
    this.cartStore.updateQty(productId, current - 1);
  }

  removeItem(productId: string): void {
    this.cartStore.removeFromCartWithUndo(productId);
  }

  viewFullCart(): void {
    this.close();
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.close();
    this.router.navigate(['/products']);
  }

  checkout(): void {
    this.close();
    this.router.navigate(['/checkout']);
  }
}
