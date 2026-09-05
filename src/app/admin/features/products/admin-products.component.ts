import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminProduct,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';
import { AdminFormFieldComponent } from '../../shared/components/admin-form-field/admin-form-field.component';

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: AdminProduct['status'];
  imageUrl: string;
}

@Component({
  selector: 'gp-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    StatusPillComponent,
    AdminModalComponent,
    AdminFormFieldComponent,
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly products = this.dataService.products;

  // ── Filter Signals ──────────────────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly selectedStatus = signal<string>('all');
  readonly selectedPriceRange = signal<string>('all');

  // ── Available Filter Options ────────────────────────────────
  readonly categories = [
    'All Categories',
    'Audio',
    'Accessories',
    'Peripherals',
    'Workspace',
    'Docks & Hubs',
  ];

  readonly statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' },
  ];

  readonly priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $50', value: 'under50' },
    { label: '$50 – $150', value: '50to150' },
    { label: '$150 – $300', value: '150to300' },
    { label: 'Over $300', value: 'over300' },
  ];

  // ── Sorting Signals ─────────────────────────────────────────
  readonly sortColumn = signal<keyof AdminProduct | null>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // ── Selection Signals ───────────────────────────────────────
  readonly selectedIds = signal<Set<string>>(new Set());

  // ── Pagination Signals ──────────────────────────────────────
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Dropdown and Modal States ───────────────────────────────
  readonly activeDropdownId = signal<string | null>(null);
  readonly isAddEditModalOpen = signal<boolean>(false);
  readonly editingProduct = signal<AdminProduct | null>(null);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly itemToDelete = signal<AdminProduct | null>(null); // null means bulk delete
  readonly isBulkStatusDropdownOpen = signal<boolean>(false);

  // ── Form Model ──────────────────────────────────────────────
  formData: ProductFormData = this.getEmptyFormData();

  // ── Reactive Pipeline ───────────────────────────────────────

  // 1. Filtered Products
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const st = this.selectedStatus();
    const pr = this.selectedPriceRange();

    return this.products().filter(p => {
      // Search by Name or SKU
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesSku) return false;
      }

      // Category filter
      if (cat !== 'all' && cat !== 'All Categories') {
        if (p.category !== cat) return false;
      }

      // Status filter
      if (st !== 'all') {
        if (p.status !== st) return false;
      }

      // Price Range filter
      if (pr !== 'all') {
        if (pr === 'under50' && p.price >= 50) return false;
        if (pr === '50to150' && (p.price < 50 || p.price > 150)) return false;
        if (pr === '150to300' && (p.price < 150 || p.price > 300)) return false;
        if (pr === 'over300' && p.price <= 300) return false;
      }

      return true;
    });
  });

  // 2. Sorted Products
  readonly sortedProducts = computed(() => {
    const list = [...this.filteredProducts()];
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

  // 3. Paginated Products
  readonly paginatedProducts = computed(() => {
    const list = this.sortedProducts();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  // 4. Metrics & Helper Flags
  readonly totalItems = computed(() => this.filteredProducts().length);
  readonly totalCatalogCount = computed(() => this.products().length);

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
    const visible = this.paginatedProducts();
    if (visible.length === 0) return false;
    const set = this.selectedIds();
    return visible.every(p => set.has(p.id));
  });

  readonly isIndeterminate = computed(() => {
    const visible = this.paginatedProducts();
    if (visible.length === 0) return false;
    const set = this.selectedIds();
    const some = visible.some(p => set.has(p.id));
    const all = visible.every(p => set.has(p.id));
    return some && !all;
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      (this.selectedCategory() !== 'all' && this.selectedCategory() !== 'All Categories') ||
      this.selectedStatus() !== 'all' ||
      this.selectedPriceRange() !== 'all'
    );
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  // ── Global Listener to Close Row Dropdowns on outside click ──
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-dropdown-wrapper')) {
      this.activeDropdownId.set(null);
      this.isBulkStatusDropdownOpen.set(false);
    }
  }

  // ── Filter Actions ──────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onCategoryChange(cat: string): void {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  onPriceRangeChange(range: string): void {
    this.selectedPriceRange.set(range);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
    this.selectedPriceRange.set('all');
    this.currentPage.set(1);
    this.toastService.info('All filters have been reset.');
  }

  // ── Sorting Actions ─────────────────────────────────────────
  setSort(column: keyof AdminProduct): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // ── Selection Actions ───────────────────────────────────────
  toggleSelectAll(): void {
    const visible = this.paginatedProducts();
    const currentSet = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      visible.forEach(p => currentSet.delete(p.id));
    } else {
      visible.forEach(p => currentSet.add(p.id));
    }

    this.selectedIds.set(currentSet);
  }

  toggleSelectRow(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
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

  // ── Add & Edit Modal Handlers ───────────────────────────────
  openAddModal(): void {
    this.router.navigate(['/admin/products/new']);
  }

  openEditModal(product: AdminProduct, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.router.navigate(['/admin/products', product.id, 'edit']);
  }

  closeAddEditModal(): void {
    this.isAddEditModalOpen.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(): void {
    if (!this.formData.name.trim()) {
      this.toastService.error('Product name is required.');
      return;
    }
    if (!this.formData.sku.trim()) {
      this.toastService.error('Product SKU is required.');
      return;
    }
    if (this.formData.price < 0) {
      this.toastService.error('Price cannot be negative.');
      return;
    }

    const currentEditing = this.editingProduct();

    if (currentEditing) {
      // Update existing
      this.dataService.updateProduct(currentEditing.id, {
        name: this.formData.name.trim(),
        sku: this.formData.sku.trim().toUpperCase(),
        category: this.formData.category,
        price: Number(this.formData.price),
        stock: Number(this.formData.stock),
        status: this.formData.status,
        imageUrl: this.formData.imageUrl.trim() || undefined,
      });
      this.toastService.success(`Updated "${this.formData.name}".`, 'Product Saved');
    } else {
      // Create new
      this.dataService.addProduct({
        name: this.formData.name.trim(),
        sku: this.formData.sku.trim().toUpperCase(),
        category: this.formData.category,
        price: Number(this.formData.price),
        stock: Number(this.formData.stock),
        status: this.formData.status,
        imageUrl:
          this.formData.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80',
      });
      this.toastService.success(`Added "${this.formData.name}" to catalog.`, 'Product Created');
    }

    this.closeAddEditModal();
  }

  // ── Duplicate Product ───────────────────────────────────────
  duplicateProduct(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    const duplicated = this.dataService.duplicateProduct(id);
    if (duplicated) {
      this.toastService.success(
        `Duplicated as "${duplicated.name}". Saved as Draft.`,
        'Product Duplicated'
      );
    }
  }

  // ── Single & Bulk Delete Handlers ───────────────────────────
  confirmDelete(product: AdminProduct, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.itemToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedCount() === 0) return;
    this.itemToDelete.set(null); // Indicates bulk delete
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.dataService.deleteProduct(single.id);
      // Remove from selected set if present
      const set = new Set(this.selectedIds());
      set.delete(single.id);
      this.selectedIds.set(set);
      this.toastService.success(`Deleted "${single.name}".`, 'Product Removed');
    } else {
      // Bulk delete
      const ids = Array.from(this.selectedIds());
      this.dataService.deleteMultipleProducts(ids);
      const count = ids.length;
      this.selectedIds.set(new Set());
      this.toastService.success(`Deleted ${count} selected products.`, 'Bulk Delete Complete');
    }
    this.closeDeleteModal();
  }

  // ── Bulk Status Update ──────────────────────────────────────
  applyBulkStatus(newStatus: AdminProduct['status']): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    this.dataService.updateMultipleProductStatus(ids, newStatus);
    this.isBulkStatusDropdownOpen.set(false);
    this.toastService.success(
      `Updated ${ids.length} products to "${newStatus}".`,
      'Status Changed'
    );
  }

  // ── Row Quick Actions ───────────────────────────────────────
  restockProduct(product: AdminProduct, amount: number = 10, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.dataService.restockProduct(product.id, amount);
    this.toastService.success(
      `Restocked "${product.name}" (+${amount} units).`,
      'Inventory Updated'
    );
  }

  toggleProductStatus(product: AdminProduct, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    const nextStatus = product.status === 'Active' ? 'Draft' : 'Active';
    this.dataService.updateProduct(product.id, { status: nextStatus });
    this.toastService.info(
      `Changed status of "${product.name}" to ${nextStatus}.`
    );
  }

  copySku(sku: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    navigator.clipboard?.writeText(sku).then(() => {
      this.toastService.info(`Copied SKU "${sku}" to clipboard.`);
    }).catch(() => {
      this.toastService.info(`SKU: ${sku}`);
    });
  }

  exportToCsv(): void {
    const list = this.filteredProducts();
    if (list.length === 0) {
      this.toastService.warning('No products to export with current filters.');
      return;
    }

    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Sales Count'];
    const csvRows = [
      headers.join(','),
      ...list.map(p =>
        [
          `"${p.id}"`,
          `"${p.sku}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          p.price.toFixed(2),
          p.stock,
          `"${p.status}"`,
          p.salesCount,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gadgetplanet-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${list.length} products to CSV.`, 'Export Finished');
  }

  private getEmptyFormData(): ProductFormData {
    return {
      name: '',
      sku: '',
      category: 'Audio',
      price: 99.99,
      stock: 25,
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80',
    };
  }
}
