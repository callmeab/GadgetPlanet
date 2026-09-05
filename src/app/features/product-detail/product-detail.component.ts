import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MockDataService, ProductReview } from '../../core/services/mock-data.service';
import { CartStore } from '../../shared/stores/cart.store';
import { WishlistStore } from '../../shared/stores/wishlist.store';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RatingStarsComponent } from '../../shared/components/rating-stars/rating-stars.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductCarouselSectionComponent } from '../../shared/components/product-carousel-section/product-carousel-section.component';
import { Product } from '../../core/models/product.model';

export interface ColorVariant {
  name: string;
  hex: string;
}

export type DetailTab = 'description' | 'specifications' | 'reviews';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BadgeComponent,
    RatingStarsComponent,
    ButtonComponent,
    ProductCarouselSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  // Supports direct route input binding
  readonly slug = input<string>('');
  readonly id = input<string>('');

  private readonly mockData = inject(MockDataService);
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentParam = signal<string>('p001');

  // Product resolution
  readonly product = computed<Product | undefined>(() => {
    const param = this.currentParam();
    return this.mockData.getProductByIdOrSlug(param);
  });

  // Related products
  readonly relatedProducts = computed<Product[]>(() => {
    const p = this.product();
    if (!p) return [];
    return this.mockData.getRelatedProducts(p.id, p.category, 8);
  });

  // Reviews
  readonly reviews = computed<ProductReview[]>(() => {
    const p = this.product();
    return p ? this.mockData.getProductReviews(p.id) : [];
  });

  // Stores
  readonly inCart = computed(() => {
    const p = this.product();
    return p ? this.cartStore.isInCart(p.id) : false;
  });

  readonly inWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistStore.isInWishlist(p.id) : false;
  });

  // Gallery & Zoom signals
  readonly selectedImage = signal<number>(0);
  readonly isZoomed = signal<boolean>(false);
  readonly zoomPos = signal<{ x: number; y: number }>({ x: 50, y: 50 });

  // Buy panel signals
  readonly selectedVariant = signal<string>('Obsidian Black');
  readonly qty = signal<number>(1);
  readonly activeTab = signal<DetailTab>('description');

  // Delivery check signals
  readonly pincode = signal<string>('');
  readonly deliveryMessage = signal<string | null>(null);
  readonly isDeliveryChecking = signal<boolean>(false);

  // Mobile sticky bar signal
  readonly isStickyVisible = signal<boolean>(false);

  // Color Variants
  readonly variants: ColorVariant[] = [
    { name: 'Obsidian Black', hex: '#1C1C1E' },
    { name: 'Electric Blue', hex: '#0A84FF' },
    { name: 'Sunset Orange', hex: '#FF6B00' },
    { name: 'Lunar Silver', hex: '#E5E5EA' },
  ];

  // Highlights with icons
  readonly keyHighlights = [
    { icon: '⚡', title: '10-Min ASAP Charge', desc: '10 mins = 10 hours playtime' },
    { icon: '🎧', title: 'Hybrid ANC', desc: 'Up to 45dB noise suppression' },
    { icon: '🔋', title: 'Extended Battery', desc: 'Up to 60 hours combined playback' },
    { icon: '💧', title: 'IPX7 Water Resistant', desc: 'Sweat and splash-proof build' },
    { icon: '🎮', title: '35ms Beast Mode', desc: 'Ultra-low latency gaming sync' },
  ];

  // Rating breakdown
  readonly ratingBreakdown = [
    { stars: 5, percent: 78, count: 967 },
    { stars: 4, percent: 15, count: 186 },
    { stars: 3, percent: 4, count: 50 },
    { stars: 2, percent: 2, count: 25 },
    { stars: 1, percent: 1, count: 12 },
  ];

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const p = params.get('slug') || params.get('id') || 'p001';
      this.currentParam.set(p);
      this.selectedImage.set(0);
      this.qty.set(1);

      const prod = this.product();
      if (prod) {
        this.titleService.setTitle(`${prod.name} — GadgetPlanet`);
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Show sticky bottom bar on mobile when scrolled past 500px
    if (typeof window !== 'undefined') {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      this.isStickyVisible.set(scrollPos > 450);
    }
  }

  // Gallery handlers
  selectImage(index: number): void {
    this.selectedImage.set(index);
  }

  onGalleryMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.zoomPos.set({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  onGalleryMouseEnter(): void {
    this.isZoomed.set(true);
  }

  onGalleryMouseLeave(): void {
    this.isZoomed.set(false);
  }

  // Variant & Qty handlers
  selectVariant(name: string): void {
    this.selectedVariant.set(name);
  }

  decreaseQty(): void {
    if (this.qty() > 1) {
      this.qty.update(v => v - 1);
    }
  }

  increaseQty(): void {
    this.qty.update(v => v + 1);
  }

  // Cart & Buy handlers
  addToCart(): void {
    const p = this.product();
    if (p && p.inStock) {
      this.cartStore.addToCart(p, this.qty());
    }
  }

  buyNow(): void {
    const p = this.product();
    if (p && p.inStock) {
      this.cartStore.addToCart(p, this.qty());
      this.router.navigate(['/cart']);
    }
  }

  toggleWishlist(): void {
    const p = this.product();
    if (p) {
      this.wishlistStore.toggleWishlist(p);
    }
  }

  // Delivery check handler
  onPincodeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.pincode.set(target.value);
  }

  checkDelivery(): void {
    const code = this.pincode().trim();
    if (!code) {
      this.deliveryMessage.set('Please enter a city or 5-digit postal code.');
      return;
    }

    this.isDeliveryChecking.set(true);
    setTimeout(() => {
      this.isDeliveryChecking.set(false);
      this.deliveryMessage.set(
        `✓ Standard Delivery: 2-3 Business Days to "${code}". Free Shipping applied (Order > Rs. 999)!`
      );
    }, 400);
  }

  // Tab switcher
  switchTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  scrollToReviews(): void {
    this.activeTab.set('reviews');
    const el = document.getElementById('detail-tabs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  specEntries(specs?: Record<string, string>): { key: string; value: string }[] {
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }
}
