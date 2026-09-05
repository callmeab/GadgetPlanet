import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CartStore } from '../../shared/stores/cart.store';
import { WishlistStore } from '../../shared/stores/wishlist.store';

export interface MegaMenuColumn {
  heading: string;
  links: { label: string; route: string }[];
}

export interface NavCategory {
  id: string;
  label: string;
  icon: string;
  route: string;
  megaMenu: {
    columns: MegaMenuColumn[];
    promoImage: string;
    promoLabel: string;
    promoRoute: string;
  };
}

interface Announcement {
  text: string;
  highlight?: string;
  cta?: string;
}

@Component({
  selector: 'gp-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // ── Stores ─────────────────────────────────────────────────
  private readonly cartStore     = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  private readonly router        = inject(Router);

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  readonly isCurrentAdmin = computed<boolean>(() => {
    const nav = this.navEnd();
    if (nav && 'url' in nav) {
      const url = (nav as NavigationEnd).urlAfterRedirects || (nav as NavigationEnd).url;
      if (url && (url.startsWith('/admin') || url.includes('/admin'))) return true;
    }
    if (this.router.url && (this.router.url.startsWith('/admin') || this.router.url.includes('/admin'))) {
      return true;
    }
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes('/admin') || window.location.href.includes('/admin');
    }
    return false;
  });

  readonly cartCount     = this.cartStore.count;
  readonly wishlistCount = this.wishlistStore.count;

  // ── UI State signals ───────────────────────────────────────
  readonly scrolled          = signal(false);
  readonly announcementVisible = signal(true);
  readonly searchOpen        = signal(false);
  readonly searchQuery       = signal('');
  readonly activeMenu        = signal<string | null>(null);  // category id
  readonly mobileDrawerOpen  = signal(false);
  readonly activeMobileAccordion = signal<string | null>(null);

  readonly isCompact = computed(() => this.scrolled() && !this.mobileDrawerOpen());

  openCart(): void {
    this.cartStore.openDrawer();
  }

  // ── Announcements (rotating) ───────────────────────────────
  readonly announcements: Announcement[] = [
    { text: 'FREE delivery on orders above', highlight: 'Rs. 999', cta: 'Shop Now' },
    { text: '🔥 Flash Sale Live:', highlight: 'Up to 60% OFF', cta: 'Grab Deals' },
    { text: '⚡ New Arrivals:', highlight: 'AirBass Pro X1 just dropped!', cta: 'Explore' },
    { text: '🎁 Use code', highlight: 'GADGET20', cta: 'for 20% off your first order' },
  ];
  readonly currentAnnIdx = signal(0);
  private annInterval?: ReturnType<typeof setInterval>;

  // ── Category Nav Data ──────────────────────────────────────
  readonly categories: NavCategory[] = [
    {
      id: 'earbuds',
      label: 'Earbuds',
      icon: '🎧',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Type',
            links: [
              { label: 'True Wireless (TWS)',   route: '/products' },
              { label: 'Active Noise Cancelling', route: '/products' },
              { label: 'In-Ear Monitors',        route: '/products' },
              { label: 'Sport / Workout',        route: '/products' },
              { label: 'Gaming Earbuds',         route: '/products' },
            ],
          },
          {
            heading: 'Shop by Price',
            links: [
              { label: 'Under Rs. 1,000',           route: '/products' },
              { label: 'Rs. 1,000 – Rs. 2,500',        route: '/products' },
              { label: 'Rs. 2,500 – Rs. 5,000',        route: '/products' },
              { label: 'Above Rs. 5,000',           route: '/products' },
              { label: 'Best Sellers',            route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=280&q=80',
        promoLabel: 'AirBass Pro X1 — Rs. 2,499',
        promoRoute: '/products',
      },
    },
    {
      id: 'neckbands',
      label: 'Neckbands',
      icon: '🎵',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Feature',
            links: [
              { label: 'Bluetooth 5.3',   route: '/products' },
              { label: '30-hr Battery',   route: '/products' },
              { label: 'Fast Charging',   route: '/products' },
              { label: 'ANC Neckbands',   route: '/products' },
              { label: 'Premium Audio',   route: '/products' },
            ],
          },
          {
            heading: 'Top Brands',
            links: [
              { label: 'GadgetPlanet',  route: '/products' },
              { label: 'BoAt',          route: '/products' },
              { label: 'Noise',         route: '/products' },
              { label: 'JBL',           route: '/products' },
              { label: 'Sony',          route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=280&q=80',
        promoLabel: 'NeckPro 500 — Rs. 1,299',
        promoRoute: '/products',
      },
    },
    {
      id: 'smartwatches',
      label: 'Smart Watches',
      icon: '⌚',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Use',
            links: [
              { label: 'Fitness Trackers',     route: '/products' },
              { label: 'Calling Watches',      route: '/products' },
              { label: 'AMOLED Displays',      route: '/products' },
              { label: 'GPS Watches',          route: '/products' },
              { label: 'Kids Smartwatches',    route: '/products' },
            ],
          },
          {
            heading: 'Shop by Price',
            links: [
              { label: 'Under Rs. 2,000',         route: '/products' },
              { label: 'Rs. 2,000 – Rs. 5,000',     route: '/products' },
              { label: 'Rs. 5,000 – Rs. 10,000',    route: '/products' },
              { label: 'Premium Watches',      route: '/products' },
              { label: 'New Arrivals',         route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=280&q=80',
        promoLabel: 'OrbWatch Ultra — Rs. 4,999',
        promoRoute: '/products',
      },
    },
    {
      id: 'speakers',
      label: 'Speakers',
      icon: '🔊',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Type',
            links: [
              { label: 'Portable Bluetooth',   route: '/products' },
              { label: 'Waterproof Speakers',  route: '/products' },
              { label: 'Party Speakers',       route: '/products' },
              { label: 'Desk Speakers',        route: '/products' },
              { label: '360° Sound',           route: '/products' },
            ],
          },
          {
            heading: 'Shop by Wattage',
            links: [
              { label: 'Under 10W',     route: '/products' },
              { label: '10W – 30W',     route: '/products' },
              { label: '30W – 80W',     route: '/products' },
              { label: '80W & Above',   route: '/products' },
              { label: 'Best Sellers',  route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=280&q=80',
        promoLabel: 'BoomBlast 40 — Rs. 3,299',
        promoRoute: '/products',
      },
    },
    {
      id: 'powerbanks',
      label: 'Power Banks',
      icon: '🔋',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Capacity',
            links: [
              { label: '5,000 – 10,000 mAh',  route: '/products' },
              { label: '10,000 – 20,000 mAh', route: '/products' },
              { label: '20,000 mAh & Above',  route: '/products' },
              { label: 'Slim & Compact',       route: '/products' },
              { label: 'Wireless Charging',   route: '/products' },
            ],
          },
          {
            heading: 'Shop by Speed',
            links: [
              { label: '18W Fast Charge',  route: '/products' },
              { label: '30W Fast Charge',  route: '/products' },
              { label: '65W GaN Charge',   route: '/products' },
              { label: 'Solar Power Banks', route: '/products' },
              { label: 'Best Sellers',     route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1585338107373-3cf9f3f7dd48?w=280&q=80',
        promoLabel: 'TurboCharge 20K — Rs. 1,999',
        promoRoute: '/products',
      },
    },
    {
      id: 'chargers',
      label: 'Chargers',
      icon: '⚡',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Shop by Type',
            links: [
              { label: 'GaN Wall Chargers',  route: '/products' },
              { label: 'Car Chargers',       route: '/products' },
              { label: 'USB-C PD Chargers',  route: '/products' },
              { label: 'Wireless Chargers',  route: '/products' },
              { label: 'Multi-Port Hubs',    route: '/products' },
            ],
          },
          {
            heading: 'Shop by Wattage',
            links: [
              { label: 'Under 20W',   route: '/products' },
              { label: '20W – 45W',   route: '/products' },
              { label: '65W GaN',     route: '/products' },
              { label: '100W+ GaN',   route: '/products' },
              { label: 'Travel Sets', route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=280&q=80',
        promoLabel: 'GaN Pro 65W — Rs. 1,499',
        promoRoute: '/products',
      },
    },
    {
      id: 'accessories',
      label: 'Accessories',
      icon: '🔌',
      route: '/products',
      megaMenu: {
        columns: [
          {
            heading: 'Cables & Adapters',
            links: [
              { label: 'USB-C Cables',       route: '/products' },
              { label: 'Lightning Cables',   route: '/products' },
              { label: 'HDMI / Display',     route: '/products' },
              { label: 'OTG Adapters',       route: '/products' },
              { label: 'Cable Organisers',   route: '/products' },
            ],
          },
          {
            heading: 'More Accessories',
            links: [
              { label: 'Phone Cases',        route: '/products' },
              { label: 'Screen Protectors',  route: '/products' },
              { label: 'Ear Tips / Cushions', route: '/products' },
              { label: 'Stands & Mounts',    route: '/products' },
              { label: 'Gift Bundles',       route: '/products' },
            ],
          },
        ],
        promoImage: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=280&q=80',
        promoLabel: 'Explore All Accessories',
        promoRoute: '/products',
      },
    },
  ];

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.startAnnouncementRotation();
  }

  ngOnDestroy(): void {
    clearInterval(this.annInterval);
  }

  // ── Scroll listener ────────────────────────────────────────
  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
    if (window.scrollY > 60) {
      this.activeMenu.set(null);
    }
  }

  // ── Announcement bar ───────────────────────────────────────
  private startAnnouncementRotation(): void {
    this.annInterval = setInterval(() => {
      this.currentAnnIdx.update(i => (i + 1) % this.announcements.length);
    }, 3500);
  }

  dismissAnnouncement(): void {
    this.announcementVisible.set(false);
  }

  get currentAnn(): Announcement {
    return this.announcements[this.currentAnnIdx()];
  }

  // ── Mega menu ──────────────────────────────────────────────
  openMenu(id: string): void  { this.activeMenu.set(id); }
  closeMenu(): void           { this.activeMenu.set(null); }

  // ── Search ─────────────────────────────────────────────────
  toggleSearch(): void {
    this.searchOpen.update(v => !v);
    if (!this.searchOpen()) this.searchQuery.set('');
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  // ── Mobile drawer ──────────────────────────────────────────
  openDrawer(): void  { this.mobileDrawerOpen.set(true);  }
  closeDrawer(): void { this.mobileDrawerOpen.set(false); }

  toggleMobileAccordion(id: string): void {
    this.activeMobileAccordion.update(cur => cur === id ? null : id);
  }
}
