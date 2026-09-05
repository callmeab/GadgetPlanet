import {
  Component,
  input,
  output,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdminModalMode = 'modal' | 'drawer';
export type AdminModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'gp-admin-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-modal.component.html',
  styleUrls: ['./admin-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  subtitle = input<string>('');
  mode = input<AdminModalMode>('modal');
  size = input<AdminModalSize>('md');
  closeOnBackdrop = input<boolean>(true);

  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
