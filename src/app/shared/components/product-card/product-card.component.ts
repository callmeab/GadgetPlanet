import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../stores/cart.store';
import { WishlistStore } from '../../stores/wishlist.store';
import { BadgeComponent } from '../badge/badge.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'gp-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent, RatingStarsComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;

  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);

  inCart = computed(() => this.cartStore.isInCart(this.product?.id ?? ''));
  inWishlist = computed(() => this.wishlistStore.isInWishlist(this.product?.id ?? ''));

  ngOnInit(): void {}

  addToCart(event: Event): void {
    event.stopPropagation();
    this.cartStore.addToCart(this.product);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    this.wishlistStore.toggleWishlist(this.product);
  }
}
