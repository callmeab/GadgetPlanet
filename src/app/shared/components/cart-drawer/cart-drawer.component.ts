import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
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

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  readonly isCurrentAdmin = computed<boolean>(() => {
    const nav = this.navEnd();
    if (nav && 'url' in nav) {
      const url = (nav as NavigationEnd).urlAfterRedirects || (nav as NavigationEnd).url;
      if (url && (url.startsWith('/admin') || url.includes('/admin'))) return true;
    }
    if (this.router.url && (this.router.url.startsWith('/admin') || this.router.url.includes('/admin'))) {
      return true;
    }
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes('/admin') || window.location.href.includes('/admin');
    }
    return false;
  });

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
