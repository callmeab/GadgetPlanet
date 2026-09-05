import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaticPageLayoutComponent } from '../../../shared/components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'gp-about',
  standalone: true,
  imports: [CommonModule, RouterModule, StaticPageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly stats = [
    { value: '150K+', label: 'Gadgets Delivered', sub: 'Across 40+ Pakistani cities' },
    { value: '98.4%', label: 'Positive Feedback', sub: 'From verified audiophiles' },
    { value: '24-48H', label: 'Express Dispatch', sub: 'Nationwide courier transit' },
    { value: '1-Year', label: 'Official Warranty', sub: 'Direct claim center support' },
  ];

  readonly pillars = [
    {
      icon: '🎧',
      title: 'Acoustic Precision',
      desc: 'Engineered with titanium diaphragms and custom punchy bass curves specifically tuned for contemporary pop, EDM, and hip-hop beats.',
    },
    {
      icon: '⚡',
      title: 'Next-Gen Power Tech',
      desc: 'Pioneering GaN III Gallium Nitride technology to deliver 65W+ laptop and smartphone charging in thumb-sized power adapters.',
    },
    {
      icon: '🛡️',
      title: 'Guaranteed Authentic',
      desc: '100% original hardware with direct brand serial verification, zero gray-market replicas, and dedicated Lahore service facilities.',
    },
    {
      icon: '🇵🇰',
      title: 'Proudly Localized',
      desc: 'Built around the Pakistani consumer: transparent PKR pricing, verified Cash on Delivery, and instant phone hotline care.',
    },
  ];
}
