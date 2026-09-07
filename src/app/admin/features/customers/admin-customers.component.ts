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
  AdminCustomer,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

export type CustomerTab = 'All' | 'Active' | 'VIP' | 'New' | 'Inactive';

@Component({
  selector: 'gp-admin-customers',
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
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomersComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly customers = this.dataService.customers;

  // ── Tab & Filter Signals ────────────────────────────────────
  readonly tabs: CustomerTab[] = ['All', 'Active', 'VIP', 'New', 'Inactive'];
  readonly activeTab = signal<CustomerTab>('All');
  readonly searchQuery = signal<string>('');

  // ── Sorting Signals ─────────────────────────────────────────
  readonly sortColumn = signal<'name' | 'totalOrders' | 'totalSpent' | 'joinedDate'>('joinedDate');
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
  readonly customerToDelete = signal<AdminCustomer | null>(null); // null means bulk delete
  readonly isCustomerModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly editingCustomerId = signal<string | null>(null);

  // ── Customer Form Signals ───────────────────────────────────
  readonly formName = signal<string>('');
  readonly formEmail = signal<string>('');
  readonly formPhone = signal<string>('');
  readonly formStatus = signal<'Active' | 'VIP' | 'New' | 'Inactive'>('Active');
  readonly formTags = signal<string>('');
  readonly formStreet = signal<string>('');
  readonly formCity = signal<string>('');
  readonly formCountry = signal<string>('Pakistan');
  readonly formPostalCode = signal<string>('');
  readonly formErrors = signal<Record<string, string>>({});

  // ── Dynamic Tab Counts ──────────────────────────────────────
  readonly tabCounts = computed(() => {
    const list = this.customers();
    return {
      All: list.length,
      Active: list.filter(c => c.status === 'Active').length,
      VIP: list.filter(c => c.status === 'VIP').length,
      New: list.filter(c => c.status === 'New').length,
      Inactive: list.filter(c => c.status === 'Inactive').length,
    };
  });

  // ── Reactive Filtering Pipeline ─────────────────────────────
  readonly filteredCustomers = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();

    return this.customers().filter(c => {
      // Tab filter
      if (tab !== 'All' && c.status !== tab) {
        return false;
      }

      // Search query (Name, Email, Phone, City)
      if (query) {
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesEmail = c.email.toLowerCase().includes(query);
        const matchesPhone = c.phone ? c.phone.toLowerCase().includes(query) : false;
        const matchesCity = c.addresses.some(a => a.city.toLowerCase().includes(query));
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  });

  // ── Sorted Customers ────────────────────────────────────────
  readonly sortedCustomers = computed(() => {
    const list = [...this.filteredCustomers()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const factor = dir === 'asc' ? 1 : -1;

    return list.sort((a, b) => {
      let valA: any = a[col];
      let valB: any = b[col];

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * factor;
      }
      return (valA - valB) * factor;
    });
  });

  // ── Paginated View ──────────────────────────────────────────
  readonly paginatedCustomers = computed(() => {
    const sorted = this.sortedCustomers();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return sorted.slice(start, start + size);
  });

  // ── Summary Metrics ─────────────────────────────────────────
  readonly totalItems = computed(() => this.filteredCustomers().length);
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

  // ── Selection State Computeds ───────────────────────────────
  readonly isAllSelected = computed(() => {
    const pageItems = this.paginatedCustomers();
    if (pageItems.length === 0) return false;
    const selected = this.selectedIds();
    return pageItems.every(c => selected.has(c.id));
  });

  readonly isPartiallySelected = computed(() => {
    const pageItems = this.paginatedCustomers();
    const selected = this.selectedIds();
    const someSelected = pageItems.some(c => selected.has(c.id));
    return someSelected && !this.isAllSelected();
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly hasActiveFilters = computed(() => {
    return this.searchQuery() !== '' || this.activeTab() !== 'All';
  });

  // Close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-cell') && !target.closest('.card-actions')) {
      this.activeDropdownId.set(null);
    }
    if (!target.closest('.bulk-status-dropdown-container')) {
      this.isBulkStatusDropdownOpen.set(false);
    }
  }

  // ── Avatar & Visual Helpers ─────────────────────────────────
  getInitials(name: string): string {
    if (!name) return 'GP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): { bg: string; text: string } {
    const palettes = [
      { bg: '#EEF2FF', text: '#4F46E5' }, // Indigo
      { bg: '#ECFDF5', text: '#059669' }, // Emerald
      { bg: '#FDF2F8', text: '#DB2777' }, // Pink
      { bg: '#EFF6FF', text: '#2563EB' }, // Blue
      { bg: '#FFFBEB', text: '#D97706' }, // Amber
      { bg: '#F5F3FF', text: '#7C3AED' }, // Purple
      { bg: '#F0FDF4', text: '#16A34A' }, // Green
      { bg: '#F8FAFC', text: '#475569' }, // Slate
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  }

  getDefaultCity(customer: AdminCustomer): string {
    const def = customer.addresses.find(a => a.isDefault);
    if (def) return `${def.city}, ${def.country}`;
    if (customer.addresses.length > 0) {
      return `${customer.addresses[0].city}, ${customer.addresses[0].country}`;
    }
    return 'Not Specified';
  }

  // ── Tab & Filter Actions ────────────────────────────────────
  setTab(tab: CustomerTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.activeTab.set('All');
    this.currentPage.set(1);
    this.selectedIds.set(new Set());
    this.toastService.info('Filters reset to show all customers');
  }

  // ── Sorting Actions ─────────────────────────────────────────
  setSort(column: 'name' | 'totalOrders' | 'totalSpent' | 'joinedDate'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  // ── Pagination Actions ──────────────────────────────────────
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.activeDropdownId.set(null);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }

  // ── Selection Actions ───────────────────────────────────────
  toggleSelectAll(): void {
    const pageItems = this.paginatedCustomers();
    const currentSelected = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      pageItems.forEach(c => currentSelected.delete(c.id));
    } else {
      pageItems.forEach(c => currentSelected.add(c.id));
    }
    this.selectedIds.set(currentSelected);
  }

  toggleSelect(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
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

  // ── Dropdown Actions ────────────────────────────────────────
  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
  }

  toggleBulkStatusDropdown(event: Event): void {
    event.stopPropagation();
    this.isBulkStatusDropdownOpen.set(!this.isBulkStatusDropdownOpen());
  }

  // ── Navigation ──────────────────────────────────────────────
  viewCustomerDetail(id: string): void {
    this.router.navigate(['/admin/customers', id]);
  }

  // ── Bulk Actions ────────────────────────────────────────────
  applyBulkStatus(status: 'Active' | 'VIP' | 'Inactive'): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    ids.forEach(id => {
      this.dataService.updateCustomer(id, { status });
    });

    this.toastService.success(
      `Updated status to "${status}" for ${ids.length} customer${ids.length > 1 ? 's' : ''}`
    );
    this.isBulkStatusDropdownOpen.set(false);
    this.clearSelection();
  }

  // ── Delete Confirmation Modal ───────────────────────────────
  openDeleteConfirm(customer?: AdminCustomer, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeDropdownId.set(null);
    if (customer) {
      this.customerToDelete.set(customer);
    } else {
      this.customerToDelete.set(null); // Bulk delete
    }
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.customerToDelete.set(null);
  }

  executeDelete(): void {
    const single = this.customerToDelete();
    if (single) {
      this.dataService.deleteCustomer(single.id);
      this.toastService.success(`Customer "${single.name}" has been deleted.`);
    } else {
      const ids = Array.from(this.selectedIds());
      this.dataService.deleteMultipleCustomers(ids);
      this.toastService.success(
        `Deleted ${ids.length} customer${ids.length > 1 ? 's' : ''} successfully.`
      );
      this.clearSelection();
    }
    this.closeDeleteModal();
  }

  // ── Add / Edit Customer Modal ───────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.editingCustomerId.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formStatus.set('Active');
    this.formTags.set('');
    this.formStreet.set('');
    this.formCity.set('');
    this.formCountry.set('Pakistan');
    this.formPostalCode.set('');
    this.formErrors.set({});
    this.isCustomerModalOpen.set(true);
  }

  openEditModal(customer: AdminCustomer, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeDropdownId.set(null);
    this.isEditMode.set(true);
    this.editingCustomerId.set(customer.id);
    this.formName.set(customer.name);
    this.formEmail.set(customer.email);
    this.formPhone.set(customer.phone);
    this.formStatus.set(customer.status);
    this.formTags.set(customer.tags.join(', '));
    
    const defAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
    this.formStreet.set(defAddr ? defAddr.street : '');
    this.formCity.set(defAddr ? defAddr.city : '');
    this.formCountry.set(defAddr ? defAddr.country : 'Pakistan');
    this.formPostalCode.set(defAddr ? defAddr.postalCode : '');
    this.formErrors.set({});
    this.isCustomerModalOpen.set(true);
  }

  closeCustomerModal(): void {
    this.isCustomerModalOpen.set(false);
    this.formErrors.set({});
  }

  saveCustomerForm(): void {
    const errors: Record<string, string> = {};
    const name = this.formName().trim();
    const email = this.formEmail().trim();

    if (!name) {
      errors['name'] = 'Customer name is required';
    }
    if (!email) {
      errors['email'] = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      this.formErrors.set(errors);
      return;
    }

    const tags = this.formTags()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const addresses = this.formCity()
      ? [
          {
            id: `addr-${Date.now()}`,
            label: 'Primary',
            recipientName: name,
            street: this.formStreet() || 'Standard Delivery',
            city: this.formCity(),
            country: this.formCountry(),
            postalCode: this.formPostalCode() || '44000',
            phone: this.formPhone(),
            isDefault: true,
          },
        ]
      : [];

    if (this.isEditMode()) {
      const id = this.editingCustomerId();
      if (id) {
        this.dataService.updateCustomer(id, {
          name,
          email,
          phone: this.formPhone().trim(),
          status: this.formStatus(),
          tags,
          ...(addresses.length > 0 ? { addresses } : {}),
        });
        this.toastService.success(`Customer "${name}" updated successfully.`);
      }
    } else {
      this.dataService.addCustomer({
        name,
        email,
        phone: this.formPhone().trim() || '+92 300 0000000',
        joinedDate: new Date().toISOString().split('T')[0],
        status: this.formStatus(),
        tags,
        addresses,
      });
      this.toastService.success(`New customer "${name}" added to catalog.`);
    }

    this.closeCustomerModal();
  }

  // ── CSV Export ──────────────────────────────────────────────
  exportCustomersToCsv(): void {
    const list = this.sortedCustomers();
    if (list.length === 0) {
      this.toastService.warning('No customers to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Status',
      'Total Orders',
      'Total Spent (USD)',
      'Joined Date',
      'Primary City',
      'Tags',
    ];

    const rows = list.map(c => {
      const city = this.getDefaultCity(c).replace(/"/g, '""');
      const tags = c.tags.join('; ').replace(/"/g, '""');
      return [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.status}"`,
        c.totalOrders,
        c.totalSpent.toFixed(2),
        `"${c.joinedDate}"`,
        `"${city}"`,
        `"${tags}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GadgetPlanet_Customers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${list.length} customers to CSV file.`);
  }
}
