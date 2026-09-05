import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MockDataService } from '../../core/services/mock-data.service';
import { FilterStore, SortOption, ViewMode } from '../../core/services/filter.store';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product, ProductCategory } from '../../core/models/product.model';

export interface CategoryInfo {
  slug: string;
  name: string;
  category: ProductCategory | null;
  headline: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
})
export class ProductListingComponent implements OnInit {
  readonly filterStore = inject(FilterStore);
  private readonly mockData = inject(MockDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  // Collapsible accordion states for sidebar filter sections
  readonly isPriceOpen = signal<boolean>(true);
  readonly isBrandOpen = signal<boolean>(true);
  readonly isRatingOpen = signal<boolean>(true);
  readonly isAvailabilityOpen = signal<boolean>(true);

  // Category definitions & metadata
  readonly categoryList: CategoryInfo[] = [
    {
      slug: 'all',
      name: 'All Products',
      category: null,
      headline: 'The Entire Gadget Universe',
      description:
        'Explore our complete catalog of award-winning audio, wearables, fast-charging tech, and gaming gear engineered to wow.',
      icon: '🌌',
    },
    {
      slug: 'earphones',
      name: 'True Wireless Earbuds',
      category: 'Earphones',
      headline: 'Beast-Mode Audio & Hybrid ANC',
      description:
        'Wireless Bluetooth earbuds with 45dB Active Noise Cancellation, massive battery endurance, and stadium-grade bass.',
      icon: '🎧',
    },
    {
      slug: 'smartwatches',
      name: 'Smart Watches & Bands',
      category: 'Smartwatches',
      headline: 'Next-Gen AMOLED Smart Wearables',
      description:
        'Track heart rate, blood oxygen, sleep phases, and 100+ sports modes encased in rugged aerospace-grade zinc alloy.',
      icon: '⌚',
    },
    {
      slug: 'speakers',
      name: 'Bluetooth Speakers',
      category: 'Speakers',
      headline: '360° Omnidirectional Stadium Sound',
      description:
        'High-output portable wireless party speakers with pulsing RGB light shows and IPX7 submersion-proof waterproofing.',
      icon: '🔊',
    },
    {
      slug: 'headphones',
      name: 'Studio Headphones',
      category: 'Headphones',
      headline: 'Studio-Grade Hi-Res Acoustics',
      description:
        'Over-ear noise-cancelling monitors with ultra-soft protein leather earcups, 40mm titanium drivers, and 60H playback.',
      icon: '🎵',
    },
    {
      slug: 'gaming',
      name: 'Gaming Headsets & Gear',
      category: 'Gaming',
      headline: '35ms Ultra-Low Latency Spatial Audio',
      description:
        'Dominate competitive lobbies with 7.1 surround sound positioning, detachable broadcast mics, and RGB ambient glow.',
      icon: '🎮',
    },
    {
      slug: 'accessories',
      name: 'GaN Chargers & Hubs',
      category: 'Accessories',
      headline: 'Ultra-Fast GaN Charging Stations',
      description:
        '65W and 100W dual Type-C GaN power bricks, durable braided cables, 10-in-1 desktop USB hubs, and Qi wireless pads.',
      icon: '⚡',
    },
  ];

  // Active Category Meta
  readonly currentCategoryInfo = computed<CategoryInfo>(() => {
    const selected = this.filterStore.selectedCategory();
    if (!selected || selected === 'all') {
      return this.categoryList[0];
    }
    const found = this.categoryList.find(
      c =>
        c.slug.toLowerCase() === selected.toLowerCase() ||
        c.name.toLowerCase() === selected.toLowerCase() ||
        (c.category && c.category.toLowerCase() === selected.toLowerCase())
    );
    return found || this.categoryList[0];
  });

  // Dynamic Brand list with product count
  readonly availableBrands = computed(() => {
    const all = this.mockData.getAllProducts();
    const cat = this.currentCategoryInfo().category;
    const scoped = cat ? all.filter(p => p.category === cat) : all;

    const brandCounts = new Map<string, number>();
    for (const p of scoped) {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
    }

    return Array.from(brandCounts.entries()).map(([brand, count]) => ({
      brand,
      count,
    }));
  });

  // Price presets
  readonly pricePresets = [
    { label: 'Under Rs. 3,000', max: 3000 },
    { label: 'Under Rs. 7,000', max: 7000 },
    { label: 'Under Rs. 15,000', max: 15000 },
    { label: 'All Prices', max: 25000 },
  ];

  // Rating options
  readonly ratingOptions = [
    { label: '★ 4.5 & Above', value: 4.5 },
    { label: '★ 4.0 & Above', value: 4.0 },
    { label: '★ 3.5 & Above', value: 3.5 },
    { label: 'All Ratings', value: null },
  ];

  // Sort options
  readonly sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Popularity & Featured', value: 'popularity' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Top Customer Rating', value: 'rating' },
    { label: 'Newest Launches', value: 'newest' },
  ];

  // ── Computed Filtered Products ──────────────────────────────
  readonly filteredProducts = computed(() => {
    let items = this.mockData.getAllProducts();

    // 1. Category filter
    const activeCat = this.currentCategoryInfo().category;
    if (activeCat) {
      items = items.filter(p => p.category === activeCat);
    }

    // 2. Price filter
    const maxPrice = this.filterStore.priceMax();
    items = items.filter(p => (p.discountPrice ?? p.price) <= maxPrice);

    // 3. Brand filter
    const brands = this.filterStore.selectedBrands();
    if (brands.length > 0) {
      items = items.filter(p => brands.includes(p.brand));
    }

    // 4. Rating filter
    const minRat = this.filterStore.minRating();
    if (minRat !== null) {
      items = items.filter(p => p.rating >= minRat);
    }

    // 5. In-stock filter
    if (this.filterStore.inStockOnly()) {
      items = items.filter(p => p.inStock);
    }

    // 6. Sorting
    return this.sortProducts(items, this.filterStore.sortBy());
  });

  // ── Paginated Products ──────────────────────────────────────
  readonly visibleProducts = computed(() => {
    const total = this.filterStore.page() * this.filterStore.pageSize();
    return this.filteredProducts().slice(0, total);
  });

  readonly hasMoreProducts = computed(() => {
    return this.visibleProducts().length < this.filteredProducts().length;
  });

  readonly remainingCount = computed(() => {
    return Math.max(0, this.filteredProducts().length - this.visibleProducts().length);
  });

  ngOnInit(): void {
    // Listen for route params (:slug) or queryParams (?category=...)
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.filterStore.setCategory(slug);
        const info = this.currentCategoryInfo();
        this.titleService.setTitle(`${info.name} — GadgetPlanet`);
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(query => {
      const catParam = query.get('category');
      if (catParam) {
        this.filterStore.setCategory(catParam);
        const info = this.currentCategoryInfo();
        this.titleService.setTitle(`${info.name} — GadgetPlanet`);
      }
    });
  }

  private sortProducts(items: Product[], sort: SortOption): Product[] {
    switch (sort) {
      case 'price-asc':
        return [...items].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-desc':
        return [...items].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'rating':
        return [...items].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...items].sort((a, b) => (b.badges.includes('New') ? 1 : 0) - (a.badges.includes('New') ? 1 : 0));
      case 'popularity':
      default:
        return [...items].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }

  // Event Handlers
  onCategorySelect(slug: string): void {
    this.filterStore.setCategory(slug);
  }

  onPriceInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.filterStore.setPriceMax(val);
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as SortOption;
    this.filterStore.setSortBy(val);
  }

  onViewModeChange(mode: ViewMode): void {
    this.filterStore.setViewMode(mode);
  }

  toggleSection(section: 'price' | 'brand' | 'rating' | 'availability'): void {
    switch (section) {
      case 'price':
        this.isPriceOpen.update(v => !v);
        break;
      case 'brand':
        this.isBrandOpen.update(v => !v);
        break;
      case 'rating':
        this.isRatingOpen.update(v => !v);
        break;
      case 'availability':
        this.isAvailabilityOpen.update(v => !v);
        break;
    }
  }

  isBrandSelected(brand: string): boolean {
    return this.filterStore.selectedBrands().includes(brand);
  }

  removeBrand(brand: string): void {
    this.filterStore.toggleBrand(brand);
  }

  resetFilters(): void {
    this.filterStore.resetAllFilters();
  }

  onLoadMore(): void {
    this.filterStore.loadMore();
  }

  openDrawer(): void {
    this.filterStore.openMobileDrawer();
  }

  closeDrawer(): void {
    this.filterStore.closeMobileDrawer();
  }
}
