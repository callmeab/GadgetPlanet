import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'gp-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly socials = [
    {
      name: 'Twitter',
      url: '#',
      icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    },
    {
      name: 'Instagram',
      url: '#',
      icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>',
    },
    {
      name: 'YouTube',
      url: '#',
      icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.34z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/></svg>',
    },
  ];

  readonly footerLinks = [
    {
      heading: 'Shop',
      links: [
        { label: 'All Products',  route: '/products' },
        { label: 'Earphones',     route: '/products' },
        { label: 'Speakers',      route: '/products' },
        { label: 'Smartwatches',  route: '/products' },
        { label: 'Gaming',        route: '/products' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'Track Order',       route: '/' },
        { label: 'Returns & Refunds', route: '/' },
        { label: 'Warranty',          route: '/' },
        { label: 'FAQs',              route: '/' },
        { label: 'Contact Us',        route: '/' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About GadgetPlanet', route: '/' },
        { label: 'Careers',            route: '/' },
        { label: 'Press',              route: '/' },
        { label: 'Affiliate Program',  route: '/' },
        { label: 'Blog',               route: '/' },
      ],
    },
  ];
}
