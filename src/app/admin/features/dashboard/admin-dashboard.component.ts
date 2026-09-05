import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminOrder,
  AdminProduct,
  ChartDataPoint
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';
import { AdminFormFieldComponent } from '../../shared/components/admin-form-field/admin-form-field.component';

export interface ChartSvgPoint extends ChartDataPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'gp-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    StatCardComponent,
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
  readonly products = this.dataService.products;

  // ── Chart State ───────────────────────────────────────────────
  readonly selectedTimeframe = signal<'7d' | '30d' | 'year'>('7d');
  readonly hoveredPoint = signal<ChartSvgPoint | null>(null);

  readonly activeChartData = computed(() => {
    return this.dataService.chartDataSets[this.selectedTimeframe()];
  });

  readonly chartTotalRevenue = computed(() => {
    return this.activeChartData().reduce((acc, curr) => acc + curr.revenue, 0);
  });

  readonly chartTotalOrders = computed(() => {
    return this.activeChartData().reduce((acc, curr) => acc + curr.orders, 0);
  });

  // SVG Chart Geometry Calculations
  readonly svgWidth = 720;
  readonly svgHeight = 220;
  readonly padLeft = 45;
  readonly padRight = 25;
  readonly padTop = 25;
  readonly padBottom = 35;

  readonly chartSvgPoints = computed<ChartSvgPoint[]>(() => {
    const data = this.activeChartData();
    if (!data.length) return [];

    const usableWidth = this.svgWidth - this.padLeft - this.padRight;
    const usableHeight = this.svgHeight - this.padTop - this.padBottom;
    const maxRev = Math.max(...data.map(d => d.revenue), 1) * 1.12;

    return data.map((d, index) => {
      const x = this.padLeft + (index / (data.length - 1 || 1)) * usableWidth;
      const y = this.padTop + usableHeight - (d.revenue / maxRev) * usableHeight;
      return { ...d, x, y };
    });
  });

  readonly chartLinePath = computed<string>(() => {
    const points = this.chartSvgPoints();
    if (!points.length) return '';
    return points.reduce((path, pt, i) => `${path} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
  });

  readonly chartAreaPath = computed<string>(() => {
    const points = this.chartSvgPoints();
    if (!points.length) return '';
    const line = this.chartLinePath();
    const baselineY = (this.svgHeight - this.padBottom).toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const firstX = points[0].x.toFixed(1);
    return `${line} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`;
  });

  // ── Recent Orders (Top 6 latest) ──────────────────────────────
  readonly recentOrders = computed(() => {
    return this.orders().slice(0, 6);
  });

  // ── Top Selling Products (Ranked 1–5) ──────────────────────────
  readonly topSellingProducts = computed(() => {
    return [...this.products()]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  });

  // ── Low Stock Alerts (Stock <= 6) ─────────────────────────────
  readonly lowStockProducts = computed(() => {
    return this.products().filter(p => p.stock <= 6);
  });

  // ── Drawer (Order Details) State ──────────────────────────────
  readonly isDrawerOpen = signal<boolean>(false);
  readonly selectedOrder = signal<AdminOrder | null>(null);

  // ── New Product Modal State ───────────────────────────────────
  readonly isProductModalOpen = signal<boolean>(false);
  readonly newProductName = signal<string>('');
  readonly newProductSku = signal<string>('');
  readonly newProductCategory = signal<string>('Audio');
  readonly newProductPrice = signal<number | null>(null);
  readonly newProductStock = signal<number | null>(null);
  readonly productFormError = signal<string>('');

  // Timeframe selector
  setTimeframe(tf: '7d' | '30d' | 'year'): void {
    this.selectedTimeframe.set(tf);
    this.hoveredPoint.set(null);
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

  // Restock Product Action
  restockProduct(product: AdminProduct, event?: Event): void {
    event?.stopPropagation();
    this.dataService.restockProduct(product.id, 10);
    this.toastService.success(`Added +10 units to ${product.name}`, 'Stock Replenished');
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
      status: stock > 5 ? 'Active' : (stock > 0 ? 'Low Stock' : 'Out of Stock')
    });

    this.toastService.success(`Product "${name}" added to catalog`, 'Product Created');
    this.closeNewProductModal();
  }
}
