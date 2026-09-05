import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusPillVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'gp-admin-status-pill',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.scss',
})
export class StatusPillComponent {
  readonly status = input.required<string>();
  readonly label = input<string>();
  readonly size = input<'sm' | 'md'>('md');
  readonly showDot = input<boolean>(true);

  // Compute display label
  readonly displayLabel = computed(() => {
    const custom = this.label();
    if (custom) return custom;
    const raw = this.status();
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  });

  // Map arbitrary status string to semantic styling variant
  readonly variant = computed<StatusPillVariant>(() => {
    const s = this.status().toLowerCase().trim();
    if (['delivered', 'paid', 'completed', 'active', 'in_stock', 'in stock', 'published', 'success'].includes(s)) {
      return 'success';
    }
    if (['pending', 'unfulfilled', 'low_stock', 'low stock', 'attention', 'warning'].includes(s)) {
      return 'warning';
    }
    if (['cancelled', 'canceled', 'failed', 'refunded', 'out_of_stock', 'out of stock', 'danger', 'inactive'].includes(s)) {
      return 'danger';
    }
    if (['processing', 'in_transit', 'in transit', 'shipped', 'info'].includes(s)) {
      return 'info';
    }
    return 'neutral';
  });
}
