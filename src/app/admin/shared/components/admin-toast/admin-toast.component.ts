import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminToastService, AdminToast } from '../../services/admin-toast.service';

@Component({
  selector: 'gp-admin-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-toast.component.html',
  styleUrls: ['./admin-toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminToastComponent {
  private readonly toastService = inject(AdminToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
