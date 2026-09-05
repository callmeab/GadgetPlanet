import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMockDataService, AdminOrder, AdminKpiMetric } from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';
import { AdminFormFieldComponent } from '../../shared/components/admin-form-field/admin-form-field.component';

@Component({
  selector: 'gp-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    StatCardComponent,
    DataTableComponent,
    StatusPillComponent,
    AdminModalComponent,
    AdminFormFieldComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly metrics = this.dataService.metrics;
  readonly orders = this.dataService.orders;

  // Status Filter Signal
  readonly activeStatus = signal<string>('all');

  // Filtered Orders
  readonly filteredOrders = computed(() => {
    const status = this.activeStatus();
    const all = this.orders();
    if (status === 'all') return all;
    return all.filter(o => o.fulfillmentStatus === status);
  });

  // Table Columns Definition
  readonly columns: DataTableColumn[] = [
    { key: 'orderNumber', title: 'Order', width: '120px' },
    { key: 'date', title: 'Date', width: '110px' },
    { key: 'customerName', title: 'Customer' },
    { key: 'paymentStatus', title: 'Payment', width: '120px' },
    { key: 'fulfillmentStatus', title: 'Fulfillment', width: '140px' },
    { key: 'total', title: 'Total', align: 'right', width: '110px' },
    { key: 'actions', title: 'Actions', sortable: false, align: 'right', width: '100px' }
  ];

  // Drawer (Order Details) State
  readonly isDrawerOpen = signal<boolean>(false);
  readonly selectedOrder = signal<AdminOrder | null>(null);

  // New Product Modal State
  readonly isProductModalOpen = signal<boolean>(false);
  readonly newProductName = signal<string>('');
  readonly newProductSku = signal<string>('');
  readonly newProductCategory = signal<string>('Audio');
  readonly newProductPrice = signal<number | null>(null);
  readonly newProductStock = signal<number | null>(null);
  readonly productFormError = signal<string>('');

  // Status Filter Tabs
  readonly statusTabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  setStatusFilter(status: string): void {
    this.activeStatus.set(status);
  }

  // Row selection / details
  openOrderDetails(order: AdminOrder): void {
    this.selectedOrder.set(order);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedOrder.set(null);
  }

  // Quick Status Update
  updateOrderStatus(status: AdminOrder['fulfillmentStatus']): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.dataService.updateOrderStatus(order.id, status);
    this.selectedOrder.update(o => (o ? { ...o, fulfillmentStatus: status } : null));
    this.toastService.success(`Order ${order.orderNumber} updated to ${status}`, 'Status Updated');
  }

  // Bulk Actions
  handleBulkAction(event: { action: string; selectedRows: AdminOrder[] }): void {
    if (event.action === 'export') {
      this.toastService.info(`Exported ${event.selectedRows.length} orders to CSV`, 'Export Completed');
    } else if (event.action === 'delete') {
      const ids = event.selectedRows.map(r => r.id);
      this.dataService.deleteMultipleOrders(ids);
      this.toastService.warning(`Deleted ${ids.length} orders`, 'Orders Removed');
    }
  }

  // New Product Modal
  openNewProductModal(): void {
    this.newProductName.set('');
    this.newProductSku.set(`GP-${Math.floor(1000 + Math.random() * 9000)}`);
    this.newProductCategory.set('Peripherals');
    this.newProductPrice.set(null);
    this.newProductStock.set(10);
    this.productFormError.set('');
    this.isProductModalOpen.set(true);
  }

  closeNewProductModal(): void {
    this.isProductModalOpen.set(false);
  }

  saveProduct(): void {
    const name = this.newProductName().trim();
    const sku = this.newProductSku().trim();
    const price = this.newProductPrice();
    const stock = this.newProductStock() ?? 0;

    if (!name) {
      this.productFormError.set('Product name is required');
      return;
    }
    if (!price || price <= 0) {
      this.productFormError.set('Please enter a valid price greater than $0');
      return;
    }

    this.dataService.addProduct({
      sku,
      name,
      category: this.newProductCategory(),
      price,
      stock,
      status: stock > 5 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'
    });

    this.toastService.success(`Product "${name}" added to catalog`, 'Product Created');
    this.closeNewProductModal();
  }
}
