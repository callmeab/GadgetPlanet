import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface LifestyleCard {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaRoute: string;
  ctaQueryParams?: Record<string, string>;
  image: string;
  accentColor: string;
  badge?: string;
}

@Component({
  selector: 'gp-lifestyle-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lifestyle-section.component.html',
  styleUrl: './lifestyle-section.component.scss',
})
export class LifestyleSectionComponent {
  @Input() title = 'Shop by Lifestyle';
  @Input() subtitle = 'Curated gear tailored for how you move, work, party, and play';

  readonly lifestyleCards: LifestyleCard[] = [
    {
      id: 'fitness',
      tag: 'ACTIVE LIFESTYLE',
      title: 'For Fitness & Workouts',
      subtitle:
        'Sweat-resistant 45dB ANC earbuds & rugged GPS smartwatches to smash personal records.',
      ctaText: 'Explore Fitness Gear',
      ctaRoute: '/products',
      ctaQueryParams: { category: 'Smartwatches' },
      image:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80',
      accentColor: '#0A84FF',
      badge: 'IPX7 Waterproof',
    },
    {
      id: 'party',
      tag: 'BEAST-MODE BASS',
      title: 'For Parties & Beats',
      subtitle:
        'High-output wireless speakers with dynamic RGB light pulsing & 360° stadium sound.',
      ctaText: 'Unleash The Bass',
      ctaRoute: '/products',
      ctaQueryParams: { category: 'Speakers' },
      image:
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',
      accentColor: '#FF6B00',
      badge: 'Dynamic RGB',
    },
    {
      id: 'work',
      tag: 'DAILY PRODUCTIVITY',
      title: 'For Work & Hustle',
      subtitle:
        'Studio-grade hybrid ANC headphones, 65W GaN multi-chargers & 10-in-1 desktop hubs.',
      ctaText: 'Upgrade Workspace',
      ctaRoute: '/products',
      ctaQueryParams: { category: 'Accessories' },
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80',
      accentColor: '#30D158',
      badge: 'GaN Fast Charge',
    },
    {
      id: 'gaming',
      tag: 'ULTRA-LOW LATENCY',
      title: 'For Gaming & Audio',
      subtitle:
        'Spatial 3D surround sound, ultra-low 35ms latency mode & pinpoint directional microphones.',
      ctaText: 'Dominate The Game',
      ctaRoute: '/products',
      ctaQueryParams: { category: 'Gaming' },
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80',
      accentColor: '#BF5AF2',
      badge: '35ms Zero-Lag',
    },
  ];
}
