import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  InventoryItem,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

export type InventoryStatusTab = 'All' | 'Low Stock' | 'Out of Stock' | 'In Stock';

export interface CsvPreviewRow {
  sku: string;
  name: string;
  variant: string;
  currentStock: number;
  newStock: number;
  delta: number;
}

@Component({
  selector: 'gp-admin-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatusPillComponent,
    AdminModalComponent,
  ],
  templateUrl: './admin-inventory.component.html',
  styleUrls: ['./admin-inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInventoryComponent {
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly inventory = this.dataService.inventory;

  // ── Filters & Search Signals ────────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly statusTabs: InventoryStatusTab[] = ['All', 'Low Stock', 'Out of Stock', 'In Stock'];
  readonly activeStatusTab = signal<InventoryStatusTab>('All');
  readonly categoryFilter = signal<string>('all');
  readonly onlyLowStockToggle = signal<boolean>(false);

  // ── Sorting Signals ─────────────────────────────────────────
  readonly sortColumn = signal<'productName' | 'sku' | 'currentStock' | 'availableStock' | 'category'>('currentStock');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // ── Multi-selection Signals ─────────────────────────────────
  readonly selectedIds = signal<Set<string>>(new Set());

  // ── Inline Stock Editing Signals ────────────────────────────
  // Map of itemId -> draft stock number
  readonly editingStockMap = signal<Map<string, number>>(new Map());

  // ── Pagination Signals ──────────────────────────────────────
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Bulk Adjustment Modal Signals ───────────────────────────
  readonly isBulkModalOpen = signal<boolean>(false);
  readonly bulkModalMode = signal<'csv' | 'manual'>('csv');
  readonly bulkDeltaInput = signal<number>(10);
  readonly csvDragOver = signal<boolean>(false);
  readonly isCsvUploaded = signal<boolean>(false);
  readonly csvFileName = signal<string>('');

  // Sample CSV preview data
  readonly csvPreviewData = signal<CsvPreviewRow[]>([
    { sku: 'SON-XM5-NVY', name: 'Sony WH-1000XM5', variant: 'Smoky Navy', currentStock: 5, newStock: 25, delta: 20 },
    { sku: 'KEY-Q1P-BRN', name: 'Keychron Q1 Pro', variant: 'RGB / Brown', currentStock: 0, newStock: 15, delta: 15 },
    { sku: 'BNQ-SCR-PRO', name: 'BenQ ScreenBar Pro', variant: 'Metallic Silver', currentStock: 2, newStock: 20, delta: 18 },
    { sku: 'CAL-TS4-SIL', name: 'CalDigit TS4 Dock', variant: 'Titanium Silver', currentStock: 0, newStock: 12, delta: 12 },
    { sku: 'BAS-PB-100W', name: 'Baseus Blade 100W', variant: 'Graphite Black', currentStock: 0, newStock: 30, delta: 30 },
  ]);

  // ── Categories List for Dropdown ────────────────────────────
  readonly categoriesList = computed(() => {
    const list = this.inventory();
    const set = new Set<string>();
    list.forEach(i => set.add(i.category));
    return Array.from(set).sort();
  });

  // ── KPI Metrics Bar ─────────────────────────────────────────
  readonly kpiMetrics = computed(() => {
    const list = this.inventory();
    const totalVariants = list.length;
    const totalOnHand = list.reduce((sum, item) => sum + item.currentStock, 0);
    const totalReserved = list.reduce((sum, item) => sum + item.reservedStock, 0);
    const totalAvailable = list.reduce((sum, item) => sum + item.availableStock, 0);
    const lowStockCount = list.filter(item => item.status === 'Low Stock').length;
    const outOfStockCount = list.filter(item => item.status === 'Out of Stock').length;

    return {
      totalVariants,
      totalOnHand,
      totalReserved,
      totalAvailable,
      lowStockCount,
      outOfStockCount,
    };
  });

  // ── Status Tab Counts ───────────────────────────────────────
  readonly tabCounts = computed(() => {
    const list = this.inventory();
    return {
      All: list.length,
      'Low Stock': list.filter(i => i.status === 'Low Stock').length,
      'Out of Stock': list.filter(i => i.status === 'Out of Stock').length,
      'In Stock': list.filter(i => i.status === 'In Stock').length,
    };
  });

  // ── Reactive Filtering Pipeline ─────────────────────────────
  readonly filteredInventory = computed(() => {
    const list = this.inventory();
    const query = this.searchQuery().toLowerCase().trim();
    const tab = this.activeStatusTab();
    const cat = this.categoryFilter();
    const lowOnly = this.onlyLowStockToggle();

    return list.filter(item => {
      // Low-stock toggle
      if (lowOnly && item.status === 'In Stock') {
        return false;
      }

      // Status tab
      if (tab !== 'All' && item.status !== tab) {
        return false;
      }

      // Category filter
      if (cat !== 'all' && item.category !== cat) {
        return false;
      }

      // Search query
      if (query) {
        const matchesName = item.productName.toLowerCase().includes(query);
        const matchesVariant = item.variantName ? item.variantName.toLowerCase().includes(query) : false;
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesVariant && !matchesSku && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  });

  // ── Sorted Inventory ────────────────────────────────────────
  readonly sortedInventory = computed(() => {
    const list = [...this.filteredInventory()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const factor = dir === 'asc' ? 1 : -1;

    return list.sort((a, b) => {
      const valA: any = a[col];
      const valB: any = b[col];

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * factor;
      }
      return (valA - valB) * factor;
    });
  });

  // ── Paginated Inventory ─────────────────────────────────────
  readonly paginatedInventory = computed(() => {
    const sorted = this.sortedInventory();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return sorted.slice(start, start + size);
  });

  // ── Pagination Computeds ────────────────────────────────────
  readonly totalItems = computed(() => this.filteredInventory().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );
  readonly startIndex = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  readonly endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  // ── Multi-selection Computeds ───────────────────────────────
  readonly isAllSelected = computed(() => {
    const pageItems = this.paginatedInventory();
    if (pageItems.length === 0) return false;
    const selected = this.selectedIds();
    return pageItems.every(i => selected.has(i.id));
  });

  readonly isPartiallySelected = computed(() => {
    const pageItems = this.paginatedInventory();
    const selected = this.selectedIds();
    const someSelected = pageItems.some(i => selected.has(i.id));
    return someSelected && !this.isAllSelected();
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  // ── Sorting ─────────────────────────────────────────────────
  setSort(column: 'productName' | 'sku' | 'currentStock' | 'availableStock' | 'category'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // ── Filter Actions ──────────────────────────────────────────
  setStatusTab(tab: InventoryStatusTab): void {
    this.activeStatusTab.set(tab);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  onCategoryChange(cat: string): void {
    this.categoryFilter.set(cat);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  toggleLowStockFilter(): void {
    this.onlyLowStockToggle.set(!this.onlyLowStockToggle());
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeStatusTab.set('All');
    this.categoryFilter.set('all');
    this.onlyLowStockToggle.set(false);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
    this.toastService.info('Filters reset to show all inventory items.');
  }

  // ── Multi-selection Actions ─────────────────────────────────
  toggleSelectAll(): void {
    const pageItems = this.paginatedInventory();
    const current = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      pageItems.forEach(i => current.delete(i.id));
    } else {
      pageItems.forEach(i => current.add(i.id));
    }
    this.selectedIds.set(current);
  }

  toggleSelect(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  // ── Pagination Actions ──────────────────────────────────────
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }

  // ── Inline Stock Editing ────────────────────────────────────
  getDraftStock(id: string, fallback: number): number {
    const map = this.editingStockMap();
    if (map.has(id)) {
      return map.get(id)!;
    }
    return fallback;
  }

  hasUnsavedStock(id: string, currentStock: number): boolean {
    const map = this.editingStockMap();
    if (!map.has(id)) return false;
    return map.get(id) !== currentStock;
  }

  onStockInputChange(id: string, rawVal: string): void {
    const parsed = parseInt(rawVal, 10);
    const stock = isNaN(parsed) ? 0 : Math.max(0, parsed);
    const map = new Map(this.editingStockMap());
    map.set(id, stock);
    this.editingStockMap.set(map);
  }

  stepInlineStock(id: string, delta: number, currentStock: number): void {
    const current = this.getDraftStock(id, currentStock);
    const nextVal = Math.max(0, current + delta);
    const map = new Map(this.editingStockMap());
    map.set(id, nextVal);
    this.editingStockMap.set(map);
  }

  saveInlineStock(item: InventoryItem, event?: Event): void {
    if (event) event.stopPropagation();
    const draft = this.getDraftStock(item.id, item.currentStock);
    this.dataService.updateInventoryStock(item.id, draft);

    const map = new Map(this.editingStockMap());
    map.delete(item.id);
    this.editingStockMap.set(map);

    this.toastService.success(
      `Updated on-hand stock for "${item.productName} (${item.variantName || item.sku})" to ${draft}.`
    );
  }

  cancelInlineStock(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    const map = new Map(this.editingStockMap());
    map.delete(id);
    this.editingStockMap.set(map);
  }

  quickRestock(item: InventoryItem, amount: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.dataService.quickRestock(item.id, amount);
    this.toastService.success(
      `Restocked +${amount} units for "${item.sku}". Available: ${item.availableStock + amount}.`
    );
  }

  // ── Bulk Stock Adjustment Modal ─────────────────────────────
  openBulkModal(): void {
    this.bulkModalMode.set('csv');
    this.isCsvUploaded.set(false);
    this.csvFileName.set('');
    this.bulkDeltaInput.set(10);
    this.isBulkModalOpen.set(true);
  }

  closeBulkModal(): void {
    this.isBulkModalOpen.set(false);
  }

  simulateCsvUpload(files?: FileList | null): void {
    if (files && files.length > 0) {
      this.csvFileName.set(files[0].name);
    } else {
      this.csvFileName.set('gadgetplanet_inventory_restock_sep2026.csv');
    }
    this.isCsvUploaded.set(true);
    this.toastService.info('CSV file loaded. Inspect the adjustment preview below.');
  }

  onCsvDragOver(event: DragEvent): void {
    event.preventDefault();
    this.csvDragOver.set(true);
  }

  onCsvDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.csvDragOver.set(false);
  }

  onCsvDrop(event: DragEvent): void {
    event.preventDefault();
    this.csvDragOver.set(false);
    if (event.dataTransfer?.files?.length) {
      this.simulateCsvUpload(event.dataTransfer.files);
    }
  }

  downloadSampleCsv(): void {
    const headers = 'SKU,ProductName,Variant,CurrentStock,NewStock\r\n';
    const sampleRows = [
      'SON-XM5-BLK,Sony WH-1000XM5,Midnight Black,25,35',
      'KEY-Q1P-RED,Keychron Q1 Pro,RGB Red,4,20',
      'BNQ-SCR-PRO,BenQ ScreenBar Pro,Silver,2,25',
      'CAL-TS4-SIL,CalDigit TS4,Silver,0,15',
    ].join('\r\n');

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_adjustment_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.toastService.success('Downloaded sample CSV template.');
  }

  applyCsvAdjustments(): void {
    const previews = this.csvPreviewData();
    const updates = previews.map(p => {
      const found = this.inventory().find(i => i.sku === p.sku);
      return {
        id: found ? found.id : '',
        stock: p.newStock,
      };
    }).filter(u => u.id !== '');

    this.dataService.bulkUpdateStock(updates);
    this.toastService.success(`Applied CSV stock adjustments across ${updates.length} items.`);
    this.closeBulkModal();
  }

  applyManualDeltaAdjustment(): void {
    const delta = this.bulkDeltaInput();
    const selected = Array.from(this.selectedIds());

    const targetItems = selected.length > 0
      ? this.inventory().filter(i => selected.includes(i.id))
      : this.filteredInventory();

    if (targetItems.length === 0) {
      this.toastService.warning('No items selected for adjustment.');
      return;
    }

    const updates = targetItems.map(item => ({
      id: item.id,
      stock: Math.max(0, item.currentStock + delta),
    }));

    this.dataService.bulkUpdateStock(updates);
    this.toastService.success(
      `Adjusted stock (${delta >= 0 ? '+' : ''}${delta}) for ${updates.length} item${updates.length > 1 ? 's' : ''}.`
    );
    this.clearSelection();
    this.closeBulkModal();
  }

  // ── CSV Export ──────────────────────────────────────────────
  exportInventoryToCsv(): void {
    const list = this.sortedInventory();
    if (list.length === 0) {
      this.toastService.warning('No inventory items to export.');
      return;
    }

    const headers = [
      'SKU',
      'Product Name',
      'Variant',
      'Category',
      'On Hand Stock',
      'Reserved Stock',
      'Available Stock',
      'Low Stock Threshold',
      'Status',
      'Last Updated',
    ];

    const rows = list.map(item => [
      `"${item.sku}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${(item.variantName || '').replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.currentStock,
      item.reservedStock,
      item.availableStock,
      item.lowStockThreshold,
      `"${item.status}"`,
      `"${item.lastUpdated || ''}"`,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GadgetPlanet_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${list.length} inventory items to CSV.`);
  }
}
