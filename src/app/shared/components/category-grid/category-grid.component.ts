import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CategoryTile {
  id: string;
  name: string;
  label: string;
  icon: string;
  image: string;
  itemCount: number;
  badge?: string;
}

@Component({
  selector: 'gp-category-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-grid.component.html',
  styleUrl: './category-grid.component.scss',
})
export class CategoryGridComponent {
  @Input() title = 'Shop by Category';
  @Input() subtitle = 'Explore our top tech collections curated for every lifestyle';
  @Input() viewAllRoute = '/products';

  @ViewChild('scrollContainer') scrollContainerRef?: ElementRef<HTMLDivElement>;

  readonly mobileViewMode = signal<'scroll' | 'grid'>('scroll');

  readonly categories: CategoryTile[] = [
    {
      id: 'earbuds',
      name: 'Earphones',
      label: 'True Wireless',
      icon: '🎧',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80',
      itemCount: 4,
      badge: 'Trending',
    },
    {
      id: 'smartwatches',
      name: 'Smartwatches',
      label: 'Smart Watches',
      icon: '⌚',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
      itemCount: 3,
      badge: 'Popular',
    },
    {
      id: 'speakers',
      name: 'Speakers',
      label: 'BT Speakers',
      icon: '🔊',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80',
      itemCount: 3,
    },
    {
      id: 'neckbands',
      name: 'Earphones',
      label: 'Neckbands',
      icon: '🎵',
      image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=300&q=80',
      itemCount: 2,
    },
    {
      id: 'gaming',
      name: 'Gaming',
      label: 'Gaming Gear',
      icon: '🎮',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80',
      itemCount: 2,
      badge: 'New',
    },
    {
      id: 'powerbanks',
      name: 'Accessories',
      label: 'Power Banks',
      icon: '🔋',
      image: 'https://images.unsplash.com/photo-1609592426861-638f297925e0?w=300&q=80',
      itemCount: 3,
    },
    {
      id: 'chargers',
      name: 'Accessories',
      label: 'Fast Chargers',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80',
      itemCount: 3,
      badge: 'GaN Tech',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      label: 'Accessories',
      icon: '🔌',
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&q=80',
      itemCount: 4,
    },
  ];

  setMobileViewMode(mode: 'scroll' | 'grid'): void {
    this.mobileViewMode.set(mode);
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainerRef) return;
    const el = this.scrollContainerRef.nativeElement;
    const amount = 220;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }
}
