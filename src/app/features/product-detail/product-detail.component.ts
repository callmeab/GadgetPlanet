import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { CartStore } from '../../shared/stores/cart.store';
import { WishlistStore } from '../../shared/stores/wishlist.store';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent, RatingStarsComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  // Angular 19: input() signal — binds route param via withComponentInputBinding()
  readonly id = input<string>('');

  private readonly mockData      = inject(MockDataService);
  private readonly cartStore     = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);

  readonly product    = computed(() => this.mockData.getProductById(this.id()));
  readonly inCart     = computed(() => this.cartStore.isInCart(this.id()));
  readonly inWishlist = computed(() => this.wishlistStore.isInWishlist(this.id()));

  readonly selectedImage = signal(0);
  readonly qty           = signal(1);

  addToCart(product: Product | undefined): void {
    if (product) this.cartStore.addToCart(product, this.qty());
  }

  toggleWishlist(product: Product | undefined): void {
    if (product) this.wishlistStore.toggleWishlist(product);
  }

  decreaseQty(): void {
    if (this.qty() > 1) this.qty.update(v => v - 1);
  }

  increaseQty(): void {
    this.qty.update(v => v + 1);
  }

  specEntries(specs: Record<string, string>): { key: string; value: string }[] {
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }
}
