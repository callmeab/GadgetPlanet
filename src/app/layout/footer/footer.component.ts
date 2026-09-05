import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export interface FooterLinkItem {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
  isNew?: boolean;
}

export interface FooterLinkGroup {
  heading: string;
  id: string;
  links: FooterLinkItem[];
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  shortName: string;
  type: 'card' | 'wallet' | 'cod' | 'security';
  badgeColor: string;
}

export interface SocialItem {
  name: string;
  url: string;
  hoverColor: string;
  iconSvg: string;
}

@Component({
  selector: 'gp-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly router = inject(Router);

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

  readonly currentYear = new Date().getFullYear();

  // Signal managing which accordion sections are open on mobile
  readonly openAccordions = signal<Set<string>>(new Set<string>(['shop']));

  toggleAccordion(groupId: string): void {
    const current = new Set(this.openAccordions());
    if (current.has(groupId)) {
      current.delete(groupId);
    } else {
      current.add(groupId);
    }
    this.openAccordions.set(current);
  }

  isAccordionOpen(groupId: string): boolean {
    return this.openAccordions().has(groupId);
  }

  readonly linkGroups: FooterLinkGroup[] = [
    {
      heading: 'Shop',
      id: 'shop',
      links: [
        { label: 'True Wireless Earbuds', route: '/products', queryParams: { category: 'Earphones' } },
        { label: 'Smartwatches & Bands', route: '/products', queryParams: { category: 'Smartwatches' } },
        { label: 'Bluetooth Speakers', route: '/products', queryParams: { category: 'Speakers' } },
        { label: 'Gaming Headphones', route: '/products', queryParams: { category: 'Gaming' }, isNew: true },
        { label: 'GaN Fast Chargers', route: '/products', queryParams: { category: 'Accessories' } },
        { label: 'Power Banks & Hubs', route: '/products', queryParams: { category: 'Accessories' } },
        { label: 'View All Collections →', route: '/products' },
      ],
    },
    {
      heading: 'Help & Support',
      id: 'help',
      links: [
        { label: 'Track Your Order', route: '/track-order' },
        { label: 'Warranty & Registration', route: '/warranty-policy' },
        { label: '30-Day Easy Returns', route: '/warranty-policy' },
        { label: 'Shipping & Delivery', route: '/faq' },
        { label: 'FAQs & Troubleshooting', route: '/faq' },
        { label: 'Authorized Service Centers', route: '/contact' },
        { label: 'Contact Support Team', route: '/contact' },
      ],
    },
    {
      heading: 'Company',
      id: 'company',
      links: [
        { label: 'About GadgetPlanet', route: '/about' },
        { label: 'Careers (We are hiring!)', route: '/about', isNew: true },
        { label: 'Press & Media Mentions', route: '/about' },
        { label: 'Sustainability & Planet First', route: '/about' },
        { label: 'Affiliate & Creator Program', route: '/about' },
        { label: 'Corporate & Bulk Gifting', route: '/contact' },
        { label: 'Store Locator', route: '/contact' },
      ],
    },
  ];

  readonly socials: SocialItem[] = [
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      hoverColor: '#E1306C',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>',
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com',
      hoverColor: '#FF0000',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.34z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/></svg>',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com',
      hoverColor: '#1DA1F2',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      hoverColor: '#1877F2',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    },
    {
      name: 'Discord',
      url: 'https://discord.com',
      hoverColor: '#5865F2',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      hoverColor: '#0A66C2',
      iconSvg:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>',
    },
  ];

  readonly paymentMethods: PaymentMethodItem[] = [
    { id: 'visa', name: 'Visa', shortName: 'VISA', type: 'card', badgeColor: '#1A1F71' },
    { id: 'mastercard', name: 'Mastercard', shortName: 'MC', type: 'card', badgeColor: '#EB001B' },
    { id: 'cod', name: 'Cash on Delivery', shortName: 'COD', type: 'cod', badgeColor: '#FF6B00' },
    { id: 'jazzcash', name: 'JazzCash', shortName: 'JazzCash', type: 'wallet', badgeColor: '#ED1C24' },
    { id: 'easypaisa', name: 'Easypaisa', shortName: 'Easypaisa', type: 'wallet', badgeColor: '#00A859' },
    { id: 'ssl', name: '256-Bit SSL Secure', shortName: '256-Bit SSL', type: 'security', badgeColor: '#0A84FF' },
  ];

  readonly legalLinks = [
    { label: 'Privacy Policy', route: '/warranty-policy' },
    { label: 'Terms of Service', route: '/warranty-policy' },
    { label: 'Warranty Policy', route: '/warranty-policy' },
    { label: 'Shipping & Delivery', route: '/faq' },
    { label: 'Cookie Settings', route: '/faq' },
  ];
}
