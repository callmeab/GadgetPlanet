import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product, ProductCategory } from '../../core/models/product.model';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
})
export class ProductListingComponent {
  private readonly mockData = inject(MockDataService);

  readonly selectedCategory = signal<ProductCategory | null>(null);
  readonly sortBy            = signal<string>('featured');
  readonly inStockOnly       = signal(false);
  readonly filtersOpen       = signal(false);

  readonly categories = this.mockData.getCategories() as ProductCategory[];

  readonly sortOptions = [
    { label: 'Featured',           value: 'featured'   },
    { label: 'Price: Low to High', value: 'price-asc'  },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Top Rated',          value: 'rating'     },
    { label: 'Most Reviewed',      value: 'reviews'    },
  ];

  readonly filteredProducts = computed(() => {
    let products = this.mockData.getAllProducts();

    if (this.selectedCategory()) {
      products = products.filter(p => p.category === this.selectedCategory());
    }
    if (this.inStockOnly()) {
      products = products.filter(p => p.inStock);
    }
    return this.sort(products);
  });

  private sort(products: Product[]): Product[] {
    switch (this.sortBy()) {
      case 'price-asc':  return [...products].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-desc': return [...products].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'rating':     return [...products].sort((a, b) => b.rating - a.rating);
      case 'reviews':    return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
      default:           return products;
    }
  }

  toggleInStock(): void  { this.inStockOnly.update(v => !v); }
  toggleFilters(): void  { this.filtersOpen.update(v => !v); }
}
