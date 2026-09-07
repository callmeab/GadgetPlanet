import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminMockDataService,
  CustomerReportRow,
  ProductPerformanceRow,
  SalesReportRow,
} from '../../services/admin-mock-data.service';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';

export type ReportTabId = 'sales' | 'products' | 'customers';
export type ReportTimeframe = '7d' | '30d' | 'quarter' | 'year';

@Component({
  selector: 'gp-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusPillComponent,
  ],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReportsComponent {
  private readonly mockData = inject(AdminMockDataService);

  // ── Tabs & Timeframe State ──────────────────────────────────
  readonly activeTab = signal<ReportTabId>('sales');
  readonly activeTimeframe = signal<ReportTimeframe>('30d');

  readonly tabs: { id: ReportTabId; label: string; badge?: string }[] = [
    { id: 'sales', label: 'Sales Report', badge: 'Live' },
    { id: 'products', label: 'Product Performance' },
    { id: 'customers', label: 'Customer Report' },
  ];

  readonly timeframeOptions: { id: ReportTimeframe; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  // ── Hovered Chart Tooltip State ─────────────────────────────
  readonly hoveredPoint = signal<{ label: string; value: number; x: number; y: number } | null>(null);

  // ── Data Queries ────────────────────────────────────────────
  readonly salesReport = computed(() =>
    this.mockData.getSalesReportData(this.activeTimeframe())
  );

  readonly productPerformance = computed(() =>
    this.mockData.getProductPerformanceData(this.activeTimeframe())
  );

  readonly customerReport = computed(() =>
    this.mockData.getCustomerReportData(this.activeTimeframe())
  );

  // ── Chart Dimensions & Calculations ─────────────────────────
  readonly svgWidth = 720;
  readonly svgHeight = 220;
  readonly svgPadding = { top: 20, right: 30, bottom: 35, left: 50 };

  // Sales Chart SVG Points (Line & Area)
  readonly salesChartPoints = computed(() => {
    const points = this.salesReport().chartPoints;
    if (points.length === 0) return [];

    const maxRev = Math.max(...points.map(p => p.revenue), 1000);
    const plotWidth = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
    const plotHeight = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;
    const stepX = plotWidth / (points.length - 1 || 1);

    return points.map((p, index) => {
      const x = this.svgPadding.left + index * stepX;
      const normalizedY = (p.revenue / maxRev) * plotHeight;
      const y = this.svgHeight - this.svgPadding.bottom - normalizedY;
      return { ...p, x, y };
    });
  });

  readonly salesAreaPath = computed(() => {
    const pts = this.salesChartPoints();
    if (pts.length < 2) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const bottomY = this.svgHeight - this.svgPadding.bottom;

    let d = `M ${first.x},${bottomY} L ${first.x},${first.y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x},${pts[i].y}`;
    }
    d += ` L ${last.x},${bottomY} Z`;
    return d;
  });

  readonly salesLinePath = computed(() => {
    const pts = this.salesChartPoints();
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x},${pts[i].y}`;
    }
    return d;
  });

  // Product Performance Max Values for Bar scaling
  readonly maxProductRevenue = computed(() => {
    const bars = this.productPerformance().chartBars;
    return Math.max(...bars.map(b => b.revenue), 10000);
  });

  // Customer Acquisition SVG Paths (New vs Returning)
  readonly customerAcquisitionPoints = computed(() => {
    const data = this.customerReport().acquisitionChart;
    if (data.length === 0) return { newPts: [], retPts: [] };

    const maxVal = Math.max(
      ...data.map(d => Math.max(d.newCust, d.returningCust)),
      50
    );
    const plotWidth = this.svgWidth - this.svgPadding.left - this.svgPadding.right;
    const plotHeight = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;
    const stepX = plotWidth / (data.length - 1 || 1);

    const newPts = data.map((d, index) => {
      const x = this.svgPadding.left + index * stepX;
      const y = this.svgHeight - this.svgPadding.bottom - (d.newCust / maxVal) * plotHeight;
      return { label: d.label, val: d.newCust, x, y };
    });

    const retPts = data.map((d, index) => {
      const x = this.svgPadding.left + index * stepX;
      const y = this.svgHeight - this.svgPadding.bottom - (d.returningCust / maxVal) * plotHeight;
      return { label: d.label, val: d.returningCust, x, y };
    });

    return { newPts, retPts };
  });

  readonly customerNewLinePath = computed(() => {
    const pts = this.customerAcquisitionPoints().newPts;
    if (pts.length < 2) return '';
    return pts.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`), '');
  });

  readonly customerRetLinePath = computed(() => {
    const pts = this.customerAcquisitionPoints().retPts;
    if (pts.length < 2) return '';
    return pts.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`), '');
  });

  // ── Tab & Timeframe Handlers ────────────────────────────────
  setTab(tab: ReportTabId): void {
    this.activeTab.set(tab);
    this.hoveredPoint.set(null);
  }

  setTimeframe(tf: ReportTimeframe): void {
    this.activeTimeframe.set(tf);
    this.hoveredPoint.set(null);
  }

  setHoveredPoint(p: { label: string; value: number; x: number; y: number } | null): void {
    this.hoveredPoint.set(p);
  }

  // ── Client-side CSV Export ──────────────────────────────────
  exportCsv(): void {
    const tab = this.activeTab();
    const tf = this.activeTimeframe();
    const timestamp = new Date().toISOString().substring(0, 10);

    if (tab === 'sales') {
      const headers = ['Date / Interval', 'Orders', 'Gross Sales ($)', 'Discounts ($)', 'Shipping ($)', 'Net Sales ($)', 'AOV ($)'];
      const rows = this.salesReport().rows.map(r => [
        `"${r.date}"`,
        r.orders,
        r.grossSales.toFixed(2),
        r.discounts.toFixed(2),
        r.shipping.toFixed(2),
        r.netSales.toFixed(2),
        r.aov.toFixed(2),
      ]);
      this.downloadCsvFile(`sales-report-${tf}-${timestamp}.csv`, headers, rows);
    } else if (tab === 'products') {
      const headers = ['Product ID', 'Product Name', 'Category', 'Units Sold', 'Gross Revenue ($)', 'Stock Status', 'Stock Count', 'Conversion Rate'];
      const rows = this.productPerformance().rows.map(r => [
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        r.unitsSold,
        r.grossRevenue.toFixed(2),
        `"${r.stockStatus}"`,
        r.stockCount,
        `"${r.conversionRate}"`,
      ]);
      this.downloadCsvFile(`product-performance-${tf}-${timestamp}.csv`, headers, rows);
    } else {
      const headers = ['Customer ID', 'Customer Name', 'Email', 'Total Orders', 'Total Spent ($)', 'AOV ($)', 'Last Order Date', 'Status'];
      const rows = this.customerReport().rows.map(r => [
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.email}"`,
        r.totalOrders,
        r.totalSpent.toFixed(2),
        r.aov.toFixed(2),
        `"${r.lastOrderDate}"`,
        `"${r.status}"`,
      ]);
      this.downloadCsvFile(`customer-report-${tf}-${timestamp}.csv`, headers, rows);
    }
  }

  private downloadCsvFile(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
