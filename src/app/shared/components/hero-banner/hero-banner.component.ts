import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

export interface HeroSlide {
  id: string;
  badge: string;
  titleLine1: string;
  titleAccent: string;
  subtitle: string;
  tagPrice: string;
  ctaText: string;
  ctaRoute: string;
  image: string;
  accentColor: string;
  bgGlow: string;
}

@Component({
  selector: 'gp-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  @Input() autoPlayInterval = 5000;

  readonly currentIndex = signal(0);
  readonly isHovered = signal(false);
  readonly direction = signal<'next' | 'prev'>('next');

  private timerId?: ReturnType<typeof setInterval>;

  readonly slides: HeroSlide[] = [
    {
      id: 'airbass-pro',
      badge: 'NEW LAUNCH 2026',
      titleLine1: 'Level Up Your',
      titleAccent: 'Acoustic Game.',
      subtitle:
        'Immerse yourself in studio-grade 45dB hybrid ANC with 60-hour playtime and ultra-low latency gaming mode.',
      tagPrice: 'Starting at Rs. 2,499',
      ctaText: 'Shop AirBass Pro',
      ctaRoute: '/products',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      accentColor: '#0A84FF',
      bgGlow: 'rgba(10, 132, 255, 0.28)',
    },
    {
      id: 'orbwatch-ultra',
      badge: 'FLAGSHIP SERIES',
      titleLine1: 'Titanium Tough.',
      titleAccent: 'Peak Precision.',
      subtitle:
        '1.96" AMOLED display, aerospace-grade titanium frame, multi-satellite dual GPS and real-time biometric metrics.',
      tagPrice: 'Launch Offer • Rs. 4,999',
      ctaText: 'Explore OrbWatch',
      ctaRoute: '/products',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      accentColor: '#FF6B00',
      bgGlow: 'rgba(255, 107, 0, 0.26)',
    },
    {
      id: 'boomblast-40w',
      badge: 'PARTY ANIMAL',
      titleLine1: 'Unleash The',
      titleAccent: 'Thunderous Bass.',
      subtitle:
        'Dual 20W passive radiators, IPX7 waterproof storm rating, and 360° dynamic RGB party lighting beats.',
      tagPrice: 'Hot Deal • Rs. 3,299',
      ctaText: 'Get BoomBlast',
      ctaRoute: '/products',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      accentColor: '#A855F7',
      bgGlow: 'rgba(168, 85, 247, 0.28)',
    },
    {
      id: 'turbocharge-20k',
      badge: 'POWER ESSENTIAL',
      titleLine1: 'Blazing Fast.',
      titleAccent: 'Infinite Power.',
      subtitle:
        '65W GaN high-speed power delivery, dual Type-C ports, and real-time LED digital percentage display.',
      tagPrice: 'Only Rs. 1,999',
      ctaText: 'Grab TurboCharge',
      ctaRoute: '/products',
      image: 'https://images.unsplash.com/photo-1609592426861-638f297925e0?w=800&q=80',
      accentColor: '#00D68F',
      bgGlow: 'rgba(0, 214, 143, 0.25)',
    },
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  next(): void {
    this.direction.set('next');
    this.currentIndex.update((i) => (i + 1) % this.slides.length);
  }

  prev(): void {
    this.direction.set('prev');
    this.currentIndex.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  goTo(index: number): void {
    if (index === this.currentIndex()) return;
    this.direction.set(index > this.currentIndex() ? 'next' : 'prev');
    this.currentIndex.set(index);
  }

  onMouseEnter(): void {
    this.isHovered.set(true);
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    this.timerId = setInterval(() => {
      if (!this.isHovered()) {
        this.next();
      }
    }, this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }
}
