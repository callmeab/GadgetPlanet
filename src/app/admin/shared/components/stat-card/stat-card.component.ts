import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gp-admin-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly change = input<number>(); // e.g. +12.5 or -4.2
  readonly changeLabel = input<string>('vs last period');
  readonly icon = input<string>(); // icon svg or emoji
  readonly badgeText = input<string>(); // e.g. "Live" or "30d"

  // Determine trend direction
  readonly isPositive = computed(() => {
    const val = this.change();
    return val !== undefined && val > 0;
  });

  readonly isNegative = computed(() => {
    const val = this.change();
    return val !== undefined && val < 0;
  });

  readonly formattedChange = computed(() => {
    const val = this.change();
    if (val === undefined) return '';
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(1)}%`;
  });
}
