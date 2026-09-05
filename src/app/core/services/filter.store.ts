import { computed, Injectable, signal } from '@angular/core';

export type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
export type ViewMode = 'grid' | 'list';

@Injectable({ providedIn: 'root' })
export class FilterStore {
  readonly selectedCategory = signal<string | null>(null);
  readonly priceMax = signal<number>(25000);
  readonly selectedBrands = signal<string[]>([]);
  readonly minRating = signal<number | null>(null);
  readonly inStockOnly = signal<boolean>(false);
  readonly sortBy = signal<SortOption>('popularity');
  readonly viewMode = signal<ViewMode>('grid');

  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(8);
  readonly isLoadingMore = signal<boolean>(false);
  readonly isMobileDrawerOpen = signal<boolean>(false);

  // Computed count of active filters (excluding category, sort, and pagination)
  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.priceMax() < 25000) count++;
    if (this.selectedBrands().length > 0) count += this.selectedBrands().length;
    if (this.minRating() !== null) count++;
    if (this.inStockOnly()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  setCategory(catOrSlug: string | null): void {
    this.selectedCategory.set(catOrSlug);
    this.page.set(1);
  }

  setPriceMax(val: number): void {
    this.priceMax.set(val);
    this.page.set(1);
  }

  toggleBrand(brand: string): void {
    const current = [...this.selectedBrands()];
    const index = current.indexOf(brand);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(brand);
    }
    this.selectedBrands.set(current);
    this.page.set(1);
  }

  setRating(rating: number | null): void {
    this.minRating.set(rating);
    this.page.set(1);
  }

  toggleInStock(): void {
    this.inStockOnly.update(v => !v);
    this.page.set(1);
  }

  setSortBy(sort: SortOption): void {
    this.sortBy.set(sort);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  openMobileDrawer(): void {
    this.isMobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  loadMore(): void {
    if (this.isLoadingMore()) return;
    this.isLoadingMore.set(true);
    setTimeout(() => {
      this.page.update(p => p + 1);
      this.isLoadingMore.set(false);
    }, 450);
  }

  resetAllFilters(): void {
    this.priceMax.set(25000);
    this.selectedBrands.set([]);
    this.minRating.set(null);
    this.inStockOnly.set(false);
    this.sortBy.set('popularity');
    this.page.set(1);
  }
}
