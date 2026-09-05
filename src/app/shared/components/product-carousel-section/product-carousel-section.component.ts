import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'gp-product-carousel-section',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-carousel-section.component.html',
  styleUrl: './product-carousel-section.component.scss',
})
export class ProductCarouselSectionComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input({ required: true }) products: Product[] = [];
  @Input() tabs: string[] = [];
  @Input() viewAllRoute = '/products';
  @Input() viewAllQueryParam?: Record<string, string>;
  @Input() viewAllText = 'See all →';

  @Input() set loading(val: boolean) {
    this.isLoading.set(val);
  }

  @ViewChild('carouselTrack') trackRef?: ElementRef<HTMLDivElement>;

  readonly selectedTab = signal('All');
  readonly isLoading = signal(false);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(true);
  readonly skeletonItems = [1, 2, 3, 4];

  readonly filteredProducts = computed(() => {
    const tab = this.selectedTab().toLowerCase();
    const list = this.products ?? [];
    if (!tab || tab === 'all') {
      return list;
    }
    return list.filter(
      (p) =>
        p.category.toLowerCase().includes(tab) ||
        p.name.toLowerCase().includes(tab)
    );
  });

  selectTab(tab: string): void {
    if (this.selectedTab() === tab) return;
    this.selectedTab.set(tab);
    if (this.trackRef) {
      this.trackRef.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.trackRef) return;
    const el = this.trackRef.nativeElement;
    const scrollAmount = 310;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  onScroll(): void {
    if (!this.trackRef) return;
    const el = this.trackRef.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 10);
    this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }
}
