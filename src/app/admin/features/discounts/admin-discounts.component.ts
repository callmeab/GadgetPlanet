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
  AdminDiscount,
  AdminMockDataService,
  DiscountAppliesTo,
  DiscountStatus,
  DiscountType,
} from '../../services/admin-mock-data.service';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';

@Component({
  selector: 'gp-admin-discounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminModalComponent,
    StatusPillComponent,
  ],
  templateUrl: './admin-discounts.component.html',
  styleUrls: ['./admin-discounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDiscountsComponent {
  private readonly mockData = inject(AdminMockDataService);

  readonly discounts = this.mockData.discounts;

  // ── Available Categories for Multi-select ───────────────────
  readonly availableCategories = [
    'Audio',
    'Peripherals',
    'Accessories',
    'Workspace',
    'Wearables',
  ];

  // ── Filtering, Search & Tabs ───────────────────────────────
  readonly searchQuery = signal<string>('');
  readonly selectedType = signal<string>('all');
  readonly activeStatusTab = signal<string>('All');
  readonly statusTabs = ['All', 'Active', 'Scheduled', 'Expired', 'Disabled'] as const;

  // ── Sorting & Pagination ───────────────────────────────────
  readonly sortField = signal<'code' | 'value' | 'usage' | 'startDate' | 'status'>('startDate');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  // ── Selection & Clipboard Feedback ─────────────────────────
  readonly selectedDiscountIds = signal<Set<string>>(new Set());
  readonly copiedCodeId = signal<string | null>(null);

  // ── Modal State ────────────────────────────────────────────
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingDiscountId = signal<string | null>(null);
  readonly deleteTarget = signal<AdminDiscount | null>(null);

  // ── Form State ─────────────────────────────────────────────
  readonly formCode = signal<string>('');
  readonly formDescription = signal<string>('');
  readonly formType = signal<DiscountType>('percentage');
  readonly formValue = signal<number>(15);
  readonly formMinOrderType = signal<'none' | 'amount'>('none');
  readonly formMinOrderValue = signal<number>(0);
  readonly formAppliesTo = signal<DiscountAppliesTo>('all');
  readonly formSelectedCategories = signal<string[]>([]);
  readonly formHasUsageLimit = signal<boolean>(false);
  readonly formUsageLimit = signal<number>(500);
  readonly formOncePerCustomer = signal<boolean>(true);
  readonly formStartDate = signal<string>(this.getTodayDateString());
  readonly formHasEndDate = signal<boolean>(true);
  readonly formEndDate = signal<string>(this.getDefaultEndDateString());
  readonly formError = signal<string | null>(null);

  // ── 4-KPI Metrics Computation ──────────────────────────────
  readonly kpiMetrics = computed(() => {
    const list = this.discounts();
    const activeCount = list.filter(d => d.status === 'Active').length;
    const totalRedemptions = list.reduce((sum, d) => sum + d.usageCount, 0);

    // Approximate total savings given across all redeemed vouchers
    const totalSavings = list.reduce((sum, d) => {
      let estAvgPerUse = 15;
      if (d.type === 'fixed') estAvgPerUse = d.value;
      else if (d.type === 'free_shipping') estAvgPerUse = 12;
      else estAvgPerUse = d.value * 2.2;
      return sum + d.usageCount * estAvgPerUse;
    }, 0);

    return {
      totalDiscounts: list.length,
      activeCount,
      totalRedemptions,
      totalSavings: Math.round(totalSavings),
    };
  });

  // ── Status Tab Counts ───────────────────────────────────────
  readonly tabCounts = computed(() => {
    const list = this.discounts();
    return {
      All: list.length,
      Active: list.filter(d => d.status === 'Active').length,
      Scheduled: list.filter(d => d.status === 'Scheduled').length,
      Expired: list.filter(d => d.status === 'Expired').length,
      Disabled: list.filter(d => d.status === 'Disabled').length,
    };
  });

  // ── Filtered & Sorted Discounts ────────────────────────────
  readonly filteredDiscounts = computed(() => {
    let result = [...this.discounts()];
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();
    const tab = this.activeStatusTab();

    // 1. Status Tab filter
    if (tab !== 'All') {
      result = result.filter(d => d.status === tab);
    }

    // 2. Type filter
    if (type !== 'all') {
      result = result.filter(d => d.type === type);
    }

    // 3. Search query filter (matches code, description, appliesTo categories)
    if (query) {
      result = result.filter(
        d =>
          d.code.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          (d.appliesToNames && d.appliesToNames.some(c => c.toLowerCase().includes(query)))
      );
    }

    // 4. Sorting
    const field = this.sortField();
    const order = this.sortOrder();
    const multiplier = order === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      if (field === 'code') {
        return a.code.localeCompare(b.code) * multiplier;
      }
      if (field === 'value') {
        return (a.value - b.value) * multiplier;
      }
      if (field === 'usage') {
        return (a.usageCount - b.usageCount) * multiplier;
      }
      if (field === 'startDate') {
        return a.startDate.localeCompare(b.startDate) * multiplier;
      }
      if (field === 'status') {
        return a.status.localeCompare(b.status) * multiplier;
      }
      return 0;
    });

    return result;
  });

  // ── Pagination Computations ─────────────────────────────────
  readonly totalPages = computed(() => {
    const total = this.filteredDiscounts().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  readonly paginatedDiscounts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredDiscounts().slice(start, start + this.pageSize());
  });

  readonly paginationStartIndex = computed(() => {
    if (this.filteredDiscounts().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationEndIndex = computed(() => {
    return Math.min(
      this.currentPage() * this.pageSize(),
      this.filteredDiscounts().length
    );
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // ── Selection Computations ──────────────────────────────────
  readonly selectedCount = computed(() => this.selectedDiscountIds().size);

  readonly isAllSelected = computed(() => {
    const currentList = this.paginatedDiscounts();
    if (currentList.length === 0) return false;
    const selected = this.selectedDiscountIds();
    return currentList.every(d => selected.has(d.id));
  });

  readonly isIndeterminate = computed(() => {
    const currentList = this.paginatedDiscounts();
    if (currentList.length === 0) return false;
    const selected = this.selectedDiscountIds();
    const someSelected = currentList.some(d => selected.has(d.id));
    return someSelected && !this.isAllSelected();
  });

  // ── Search & Filter Handlers ────────────────────────────────
  onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.currentPage.set(1);
  }

  setStatusTab(tab: string): void {
    this.activeStatusTab.set(tab);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('all');
    this.activeStatusTab.set('All');
    this.currentPage.set(1);
  }

  // ── Sorting Handlers ────────────────────────────────────────
  toggleSort(field: 'code' | 'value' | 'usage' | 'startDate' | 'status'): void {
    if (this.sortField() === field) {
      this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('desc');
    }
    this.currentPage.set(1);
  }

  // ── Pagination Handlers ─────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  // ── Selection Handlers ──────────────────────────────────────
  toggleSelectAll(): void {
    const currentList = this.paginatedDiscounts();
    const selected = new Set(this.selectedDiscountIds());
    if (this.isAllSelected()) {
      currentList.forEach(d => selected.delete(d.id));
    } else {
      currentList.forEach(d => selected.add(d.id));
    }
    this.selectedDiscountIds.set(selected);
  }

  toggleSelectOne(id: string): void {
    const selected = new Set(this.selectedDiscountIds());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedDiscountIds.set(selected);
  }

  deselectAll(): void {
    this.selectedDiscountIds.set(new Set());
  }

  // ── One-click Copy Code with Feedback ───────────────────────
  async copyCode(discount: AdminDiscount, event?: MouseEvent): Promise<void> {
    if (event) event.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(discount.code);
      }
      this.copiedCodeId.set(discount.id);
      setTimeout(() => {
        if (this.copiedCodeId() === discount.id) {
          this.copiedCodeId.set(null);
        }
      }, 2200);
    } catch {
      // Fallback
      this.copiedCodeId.set(discount.id);
      setTimeout(() => this.copiedCodeId.set(null), 2200);
    }
  }

  // ── Inline Status Toggle ────────────────────────────────────
  toggleStatus(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.mockData.toggleDiscountStatus(id);
  }

  // ── Duplicate Discount ──────────────────────────────────────
  duplicate(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.mockData.duplicateDiscount(id);
  }

  // ── Delete Confirmation Handlers ────────────────────────────
  promptDelete(discount: AdminDiscount, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.deleteTarget.set(discount);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.mockData.deleteDiscount(target.id);
      const selected = new Set(this.selectedDiscountIds());
      selected.delete(target.id);
      this.selectedDiscountIds.set(selected);
      this.deleteTarget.set(null);
    }
  }

  // ── Bulk Actions ────────────────────────────────────────────
  bulkActivate(): void {
    const ids = Array.from(this.selectedDiscountIds());
    this.mockData.bulkSetDiscountStatus(ids, 'Active');
    this.deselectAll();
  }

  bulkDisable(): void {
    const ids = Array.from(this.selectedDiscountIds());
    this.mockData.bulkSetDiscountStatus(ids, 'Disabled');
    this.deselectAll();
  }

  bulkDelete(): void {
    const ids = Array.from(this.selectedDiscountIds());
    this.mockData.bulkDeleteDiscounts(ids);
    this.deselectAll();
  }

  // ── Modal Create & Edit Form Handlers ───────────────────────
  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingDiscountId.set(null);
    this.formError.set(null);
    this.formCode.set(this.generateRandomCodeString());
    this.formDescription.set('');
    this.formType.set('percentage');
    this.formValue.set(20);
    this.formMinOrderType.set('none');
    this.formMinOrderValue.set(0);
    this.formAppliesTo.set('all');
    this.formSelectedCategories.set([]);
    this.formHasUsageLimit.set(false);
    this.formUsageLimit.set(500);
    this.formOncePerCustomer.set(true);
    this.formStartDate.set(this.getTodayDateString());
    this.formHasEndDate.set(true);
    this.formEndDate.set(this.getDefaultEndDateString());
    this.isModalOpen.set(true);
  }

  openEditModal(discount: AdminDiscount, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isEditing.set(true);
    this.editingDiscountId.set(discount.id);
    this.formError.set(null);
    this.formCode.set(discount.code);
    this.formDescription.set(discount.description);
    this.formType.set(discount.type);
    this.formValue.set(discount.value);
    this.formMinOrderType.set(discount.minOrderValue ? 'amount' : 'none');
    this.formMinOrderValue.set(discount.minOrderValue || 0);
    this.formAppliesTo.set(discount.appliesTo);
    this.formSelectedCategories.set(discount.appliesToNames || []);
    this.formHasUsageLimit.set(discount.usageLimit !== null && discount.usageLimit !== undefined);
    this.formUsageLimit.set(discount.usageLimit || 500);
    this.formOncePerCustomer.set(discount.oncePerCustomer);
    this.formStartDate.set(discount.startDate);
    this.formHasEndDate.set(!!discount.endDate);
    this.formEndDate.set(discount.endDate || this.getDefaultEndDateString());
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.formError.set(null);
  }

  // ── Random Code Generator ───────────────────────────────────
  generateRandomCode(): void {
    this.formCode.set(this.generateRandomCodeString());
  }

  private generateRandomCodeString(): string {
    const prefixes = ['GP', 'GADGET', 'SAVE', 'VIP', 'FLASH', 'PLANET'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${randomPart}`;
  }

  onCodeInputChange(val: string): void {
    // Force uppercase and strip spaces
    this.formCode.set(val.toUpperCase().replace(/\s+/g, ''));
  }

  toggleCategorySelection(cat: string): void {
    const list = [...this.formSelectedCategories()];
    const index = list.indexOf(cat);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(cat);
    }
    this.formSelectedCategories.set(list);
  }

  // ── Save Form (Create or Update) ────────────────────────────
  saveDiscount(): void {
    const code = this.formCode().trim();
    if (!code) {
      this.formError.set('Coupon code is required.');
      return;
    }

    if (this.formType() !== 'free_shipping' && (!this.formValue() || this.formValue() <= 0)) {
      this.formError.set('Please enter a valid discount value greater than 0.');
      return;
    }

    if (this.formType() === 'percentage' && this.formValue() > 100) {
      this.formError.set('Percentage discount cannot exceed 100%.');
      return;
    }

    if (this.formAppliesTo() === 'categories' && this.formSelectedCategories().length === 0) {
      this.formError.set('Please select at least one applicable category.');
      return;
    }

    const today = this.getTodayDateString();
    const startDate = this.formStartDate();
    const endDate = this.formHasEndDate() ? this.formEndDate() : null;

    if (endDate && endDate < startDate) {
      this.formError.set('End date cannot be earlier than start date.');
      return;
    }

    // Determine initial status based on dates
    let status: DiscountStatus = 'Active';
    if (startDate > today) {
      status = 'Scheduled';
    } else if (endDate && endDate < today) {
      status = 'Expired';
    }

    const payload = {
      code,
      description: this.formDescription().trim() || `${this.formatDiscountValue(this.formType(), this.formValue())} promotional discount`,
      type: this.formType(),
      value: this.formType() === 'free_shipping' ? 0 : this.formValue(),
      minOrderValue: this.formMinOrderType() === 'amount' ? this.formMinOrderValue() : undefined,
      appliesTo: this.formAppliesTo(),
      appliesToNames: this.formAppliesTo() === 'categories' ? this.formSelectedCategories() : undefined,
      usageLimit: this.formHasUsageLimit() ? this.formUsageLimit() : null,
      oncePerCustomer: this.formOncePerCustomer(),
      startDate,
      endDate,
      status,
    };

    if (this.isEditing() && this.editingDiscountId()) {
      this.mockData.updateDiscount(this.editingDiscountId()!, payload);
    } else {
      this.mockData.addDiscount(payload);
    }

    this.closeModal();
  }

  // ── Presentation Helpers ────────────────────────────────────
  formatDiscountValue(type: DiscountType, value: number): string {
    if (type === 'percentage') return `${value}% OFF`;
    if (type === 'fixed') return `$${value} OFF`;
    return 'Free Shipping';
  }

  formatUsageDisplay(discount: AdminDiscount): string {
    if (discount.usageLimit === null || discount.usageLimit === undefined) {
      return `${discount.usageCount} / ∞`;
    }
    return `${discount.usageCount} / ${discount.usageLimit}`;
  }

  calculateUsagePercent(discount: AdminDiscount): number {
    if (!discount.usageLimit) return 0;
    return Math.min(100, Math.round((discount.usageCount / discount.usageLimit) * 100));
  }

  private getTodayDateString(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private getDefaultEndDateString(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().substring(0, 10);
  }
}
