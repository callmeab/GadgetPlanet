import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CountdownTimerComponent } from '../../shared/components/countdown-timer/countdown-timer.component';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { ProductCarouselSectionComponent } from '../../shared/components/product-carousel-section/product-carousel-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    CountdownTimerComponent,
    HeroBannerComponent,
    ProductCarouselSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly mockData = inject(MockDataService);

  @ViewChild('dealsTrack') dealsTrackRef?: ElementRef<HTMLDivElement>;

  readonly featured    = computed(() => this.mockData.getFeaturedProducts(8));
  readonly newArrivals = computed(() => this.mockData.getNewArrivals(8));
  readonly hotDeals    = computed(() => this.mockData.getHotDeals(8));

  readonly bestsellerTabs = ['All', 'Earphones', 'Smartwatches', 'Speakers'];
  readonly newLaunchTabs   = ['All', 'Earphones', 'Accessories', 'Headphones'];

  scrollDeals(direction: 'left' | 'right'): void {
    if (!this.dealsTrackRef) return;
    const container = this.dealsTrackRef.nativeElement;
    const scrollAmount = 310;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  readonly heroStats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '500+', label: 'Premium Brands' },
    { value: '4.8★', label: 'Avg. Rating' },
  ];

  readonly categories = [
    { name: 'Earphones',    emoji: '🎧', count: 3 },
    { name: 'Speakers',     emoji: '🔊', count: 2 },
    { name: 'Smartwatches', emoji: '⌚', count: 2 },
    { name: 'Headphones',   emoji: '🎵', count: 2 },
    { name: 'Gaming',       emoji: '🎮', count: 1 },
    { name: 'Accessories',  emoji: '🔌', count: 2 },
  ];

  readonly trustItems = [
    { icon: '🚀', title: 'Free Express Delivery', desc: 'Orders above Rs. 999' },
    { icon: '🔄', title: 'Easy 30-Day Returns',   desc: 'Hassle-free returns' },
    { icon: '🛡️', title: '1-Year Warranty',        desc: 'On all products' },
    { icon: '💳', title: 'Secure Payments',        desc: 'UPI, Cards & EMI' },
  ];
}
