import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminOrder,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

export type OrderTab = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

@Component({
  selector: 'gp-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    StatusPillComponent,
    AdminModalComponent,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly orders = this.dataService.orders;

  // ── Tab & Filter Signals ────────────────────────────────────
  readonly tabs: OrderTab[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  readonly activeTab = signal<OrderTab>('All');
  readonly searchQuery = signal<string>('');
  readonly paymentFilter = signal<string>('all');

  // ── Sorting Signals ─────────────────────────────────────────
  readonly sortColumn = signal<keyof AdminOrder | null>('date');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // ── Selection Signals ───────────────────────────────────────
  readonly selectedIds = signal<Set<string>>(new Set());

  // ── Pagination Signals ──────────────────────────────────────
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Dropdown & Modal States ─────────────────────────────────
  readonly activeDropdownId = signal<string | null>(null);
  readonly isBulkStatusDropdownOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly orderToDelete = signal<AdminOrder | null>(null); // null means bulk delete

  // ── Dynamic Tab Counts ──────────────────────────────────────
  readonly tabCounts = computed(() => {
    const list = this.orders();
    return {
      All: list.length,
      Pending: list.filter(o => o.fulfillmentStatus === 'Pending').length,
      Processing: list.filter(o => o.fulfillmentStatus === 'Processing').length,
      Shipped: list.filter(o => o.fulfillmentStatus === 'Shipped').length,
      Delivered: list.filter(o => o.fulfillmentStatus === 'Delivered').length,
      Cancelled: list.filter(o => o.fulfillmentStatus === 'Cancelled').length,
    };
  });

  // ── Reactive Filtering Pipeline ─────────────────────────────
  readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();
    const pay = this.paymentFilter();

    return this.orders().filter(order => {
      // Tab filter
      if (tab !== 'All' && order.fulfillmentStatus !== tab) {
        return false;
      }

      // Search query (Order ID, Customer Name, Email, Shipping City)
      if (query) {
        const matchesId = order.orderNumber.toLowerCase().includes(query);
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesEmail = order.customerEmail.toLowerCase().includes(query);
        const matchesCity = order.city ? order.city.toLowerCase().includes(query) : false;
        if (!matchesId && !matchesName && !matchesEmail && !matchesCity) {
          return false;
        }
      }

      // Payment Status filter
      if (pay !== 'all' && order.paymentStatus !== pay) {
        return false;
      }

      return true;
    });
  });

  // Column Sorting
  readonly sortedOrders = computed(() => {
    const list = [...this.filteredOrders()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (!col) return list;

    return list.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let result = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        result = valA - valB;
      } else {
        result = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return dir === 'asc' ? result : -result;
    });
  });

  // Pagination Slice
  readonly paginatedOrders = computed(() => {
    const list = this.sortedOrders();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  // Metrics & Flags
  readonly totalItems = computed(() => this.filteredOrders().length);
  readonly totalCatalogOrders = computed(() => this.orders().length);

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  });

  readonly startIndex = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  readonly isAllSelected = computed(() => {
    const visible = this.paginatedOrders();
    if (visible.length === 0) return false;
    const set = this.selectedIds();
    return visible.every(o => set.has(o.id));
  });

  readonly isIndeterminate = computed(() => {
    const visible = this.paginatedOrders();
    if (visible.length === 0) return false;
    const set = this.selectedIds();
    const some = visible.some(o => set.has(o.id));
    const all = visible.every(o => set.has(o.id));
    return some && !all;
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' || this.paymentFilter() !== 'all';
  });

  // ── Global Listener for Dropdowns ───────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-dropdown-wrapper')) {
      this.activeDropdownId.set(null);
      this.isBulkStatusDropdownOpen.set(false);
    }
  }

  // ── Tab & Filter Actions ────────────────────────────────────
  setTab(tab: OrderTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.clearSelection();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onPaymentFilterChange(filter: string): void {
    this.paymentFilter.set(filter);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.paymentFilter.set('all');
    this.currentPage.set(1);
  }

  setSort(col: keyof AdminOrder): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  // ── Row Selection ───────────────────────────────────────────
  toggleSelectAll(): void {
    const visible = this.paginatedOrders();
    const currentSet = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      visible.forEach(o => currentSet.delete(o.id));
    } else {
      visible.forEach(o => currentSet.add(o.id));
    }

    this.selectedIds.set(currentSet);
  }

  toggleSelectRow(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    const currentSet = new Set(this.selectedIds());
    if (currentSet.has(id)) {
      currentSet.delete(id);
    } else {
      currentSet.add(id);
    }
    this.selectedIds.set(currentSet);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  // ── Pagination Actions ──────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  getPageNumbers(): (number | '...')[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  // ── Navigation to Order Detail ──────────────────────────────
  viewOrderDetail(orderId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.router.navigate(['/admin/orders', orderId]);
  }

  // ── Dropdown Actions ────────────────────────────────────────
  toggleRowDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(id);
    }
  }

  toggleBulkStatusDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isBulkStatusDropdownOpen.update(v => !v);
  }

  // ── Quick Status Update ─────────────────────────────────────
  quickUpdateStatus(order: AdminOrder, status: AdminOrder['fulfillmentStatus'], event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.dataService.updateOrderStatus(order.id, status);
    this.toastService.success(
      `Order #${order.orderNumber} marked as ${status}.`,
      'Status Updated'
    );
  }

  // ── Bulk Status Update ──────────────────────────────────────
  applyBulkStatus(status: AdminOrder['fulfillmentStatus']): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    ids.forEach(id => {
      this.dataService.updateOrderStatus(id, status);
    });

    this.isBulkStatusDropdownOpen.set(false);
    this.toastService.success(
      `Updated ${ids.length} orders to ${status}.`,
      'Bulk Status Changed'
    );
  }

  // ── Delete Order Handlers ───────────────────────────────────
  confirmSingleDelete(order: AdminOrder, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.orderToDelete.set(order);
    this.isDeleteModalOpen.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedCount() === 0) return;
    this.orderToDelete.set(null);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.orderToDelete.set(null);
  }

  executeDelete(): void {
    const single = this.orderToDelete();
    if (single) {
      this.dataService.deleteOrder(single.id);
      const set = new Set(this.selectedIds());
      set.delete(single.id);
      this.selectedIds.set(set);
      this.toastService.success(`Order #${single.orderNumber} deleted.`);
    } else {
      const ids = Array.from(this.selectedIds());
      this.dataService.deleteMultipleOrders(ids);
      const count = ids.length;
      this.selectedIds.set(new Set());
      this.toastService.success(`Deleted ${count} orders.`, 'Bulk Delete Complete');
    }
    this.closeDeleteModal();
  }

  // ── Export to CSV ───────────────────────────────────────────
  exportOrdersToCsv(): void {
    const list = this.filteredOrders();
    if (list.length === 0) {
      this.toastService.warning('No orders to export.');
      return;
    }

    const headers = ['Order Number', 'Customer Name', 'Email', 'Date', 'Total', 'Payment Status', 'Fulfillment Status', 'Carrier', 'Tracking Number'];
    const rows = [
      headers.join(','),
      ...list.map(o =>
        [
          `"${o.orderNumber}"`,
          `"${o.customerName}"`,
          `"${o.customerEmail}"`,
          `"${o.date}"`,
          o.total.toFixed(2),
          `"${o.paymentStatus}"`,
          `"${o.fulfillmentStatus}"`,
          `"${o.carrier || ''}"`,
          `"${o.trackingNumber || ''}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${list.length} orders to CSV.`, 'Export Finished');
  }
}
