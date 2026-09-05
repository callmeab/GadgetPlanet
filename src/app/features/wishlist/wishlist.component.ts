import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistStore } from '../../shared/stores/wishlist.store';
import { CartStore } from '../../shared/stores/cart.store';
import { MockDataService } from '../../core/services/mock-data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCarouselSectionComponent } from '../../shared/components/product-carousel-section/product-carousel-section.component';

@Component({
  selector: 'gp-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    ProductCarouselSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  readonly wishlistStore = inject(WishlistStore);
  readonly cartStore = inject(CartStore);
  private readonly mockDataService = inject(MockDataService);

  readonly wishlistItems = this.wishlistStore.items;
  readonly wishlistCount = this.wishlistStore.count;
  readonly isEmpty = this.wishlistStore.isEmpty;

  readonly recommendedProducts = computed(() =>
    this.mockDataService.getFeaturedProducts().slice(0, 6)
  );

  moveAllToCart(): void {
    this.wishlistStore.moveAllToCart();
  }

  clearWishlist(): void {
    this.wishlistStore.clearWishlist();
  }
}
