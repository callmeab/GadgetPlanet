import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gp-rating-stars',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss',
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() reviewCount = 0;
  @Input() showCount = true;
  @Input() showValue = false;

  get stars(): ('full' | 'half' | 'empty')[] {
    return Array.from({ length: 5 }, (_, i) => {
      const val = this.rating - i;
      if (val >= 1) return 'full';
      if (val >= 0.5) return 'half';
      return 'empty';
    });
  }
}
