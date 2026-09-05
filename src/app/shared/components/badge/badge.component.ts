import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeTag } from '../../../core/models/product.model';

@Component({
  selector: 'gp-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input() label: BadgeTag | string = '';
  @Input() id = '';

  get variant(): string {
    const map: Record<string, string> = {
      'Bestseller': 'bestseller',
      'New': 'new',
      'Hot Deal': 'hot',
      'Limited': 'limited',
      'Sale': 'sale',
      'Top Rated': 'top',
    };
    return map[this.label] ?? 'default';
  }

  get badgeClasses(): string {
    return `gp-badge gp-badge--${this.variant}`;
  }
}
