import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminOrder,
} from '../../../services/admin-mock-data.service';
import { AdminToastService } from '../../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';

@Component({
  selector: 'gp-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    StatusPillComponent,
  ],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly order = signal<AdminOrder | null>(null);
  readonly notesInput = signal<string>('');
  readonly isStatusDropdownOpen = signal<boolean>(false);
  readonly isSavingNote = signal<boolean>(false);

  readonly subtotal = computed(() => {
    const o = this.order();
    if (!o) return 0;
    if (o.subtotal !== undefined) return o.subtotal;
    return o.items.reduce((acc, item) => acc + item.totalPrice, 0);
  });

  readonly shippingFee = computed(() => this.order()?.shippingFee ?? 0);
  readonly tax = computed(() => this.order()?.tax ?? 0);
  readonly discount = computed(() => this.order()?.discount ?? 0);
  readonly total = computed(() => this.order()?.total ?? 0);

  readonly timeline = computed(() => {
    const o = this.order();
    return o?.timeline || [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/orders']);
      return;
    }
    this.loadOrder(id);
  }

  loadOrder(id: string): void {
    const found = this.dataService.getOrderById(id);
    if (!found) {
      this.toastService.error(`Order with ID "${id}" was not found.`);
      this.router.navigate(['/admin/orders']);
      return;
    }
    this.order.set(found);
    this.notesInput.set(found.notes || '');
  }

  // ── Global Listener for Dropdown ────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.status-dropdown-wrapper')) {
      this.isStatusDropdownOpen.set(false);
    }
  }

  toggleStatusDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isStatusDropdownOpen.update(v => !v);
  }

  changeStatus(status: AdminOrder['fulfillmentStatus']): void {
    const current = this.order();
    if (!current) return;

    this.dataService.updateOrderStatus(current.id, status);
    this.isStatusDropdownOpen.set(false);

    // Refresh state
    const refreshed = this.dataService.getOrderById(current.id);
    if (refreshed) {
      this.order.set(refreshed);
    }

    this.toastService.success(
      `Order #${current.orderNumber} status changed to "${status}".`,
      'Order Updated'
    );
  }

  saveNotes(): void {
    const current = this.order();
    if (!current) return;

    this.isSavingNote.set(true);
    const notes = this.notesInput().trim();
    this.dataService.updateOrderNotes(current.id, notes);

    const refreshed = this.dataService.getOrderById(current.id);
    if (refreshed) {
      this.order.set(refreshed);
    }

    this.isSavingNote.set(false);
    this.toastService.success('Internal notes saved successfully.');
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard?.writeText(text).then(() => {
      this.toastService.info(`Copied ${label} to clipboard.`);
    }).catch(() => {
      this.toastService.info(`${label}: ${text}`);
    });
  }

  printOrder(): void {
    window.print();
  }
}
