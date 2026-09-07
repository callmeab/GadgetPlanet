import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AdminMockDataService,
  AdminCustomer,
  AdminOrder,
  CustomerAddress,
} from '../../../services/admin-mock-data.service';
import { AdminToastService } from '../../../shared/services/admin-toast.service';
import { StatusPillComponent } from '../../../shared/components/status-pill/status-pill.component';
import { AdminModalComponent } from '../../../shared/components/admin-modal/admin-modal.component';

@Component({
  selector: 'gp-admin-customer-detail',
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
  templateUrl: './admin-customer-detail.component.html',
  styleUrls: ['./admin-customer-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly customerId = signal<string>('');
  
  // Live reactive lookup of customer from the service
  readonly customer = computed<AdminCustomer | undefined>(() => {
    const id = this.customerId();
    if (!id) return undefined;
    return this.dataService.getCustomerById(id);
  });

  // Customer orders loaded reactively
  readonly customerOrders = computed<AdminOrder[]>(() => {
    const cust = this.customer();
    if (!cust) return [];
    return this.dataService.getCustomerOrders(cust.email);
  });

  // 3-KPI Stats
  readonly totalOrdersCount = computed(() => {
    const cust = this.customer();
    if (!cust) return 0;
    const orders = this.customerOrders();
    return Math.max(cust.totalOrders, orders.length);
  });

  readonly lifetimeValue = computed(() => {
    const cust = this.customer();
    if (!cust) return 0;
    const orders = this.customerOrders();
    if (orders.length > 0) {
      return orders.reduce((sum, o) => sum + o.total, 0);
    }
    return cust.totalSpent;
  });

  readonly averageOrderValue = computed(() => {
    const count = this.totalOrdersCount();
    if (count === 0) return 0;
    return this.lifetimeValue() / count;
  });

  // Local state for staff notes
  readonly notesText = signal<string>('');
  readonly isSavingNote = signal<boolean>(false);

  // New tag input
  readonly newTagInput = signal<string>('');

  // Edit Customer Modal State
  readonly isEditModalOpen = signal<boolean>(false);
  readonly editName = signal<string>('');
  readonly editEmail = signal<string>('');
  readonly editPhone = signal<string>('');
  readonly editStatus = signal<'Active' | 'VIP' | 'New' | 'Inactive'>('Active');
  readonly editErrors = signal<Record<string, string>>({});

  // Add Address Modal State
  readonly isAddressModalOpen = signal<boolean>(false);
  readonly addrLabel = signal<string>('Home');
  readonly addrRecipient = signal<string>('');
  readonly addrStreet = signal<string>('');
  readonly addrCity = signal<string>('');
  readonly addrCountry = signal<string>('Pakistan');
  readonly addrPostalCode = signal<string>('');
  readonly addrPhone = signal<string>('');
  readonly addrIsDefault = signal<boolean>(false);
  readonly addrErrors = signal<Record<string, string>>({});

  // Delete Customer Modal State
  readonly isDeleteModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/customers']);
      return;
    }
    this.customerId.set(id);

    const cust = this.dataService.getCustomerById(id);
    if (!cust) {
      this.toastService.warning(`Customer "${id}" not found.`);
      this.router.navigate(['/admin/customers']);
      return;
    }

    if (cust.notes) {
      this.notesText.set(cust.notes);
    }
  }

  // ── Initials & Visuals ──────────────────────────────────────
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

  // ── Status Quick Update ─────────────────────────────────────
  onStatusChange(newStatus: string): void {
    const cust = this.customer();
    if (!cust) return;
    const status = newStatus as 'Active' | 'VIP' | 'New' | 'Inactive';
    this.dataService.updateCustomer(cust.id, { status });
    this.toastService.success(`Customer status updated to "${status}".`);
  }

  // ── Staff Notes ─────────────────────────────────────────────
  saveNotes(): void {
    const cust = this.customer();
    if (!cust) return;

    this.isSavingNote.set(true);
    setTimeout(() => {
      this.dataService.updateCustomer(cust.id, { notes: this.notesText() });
      this.isSavingNote.set(false);
      this.toastService.success('Customer notes saved successfully.');
    }, 200);
  }

  // ── Tags Management ─────────────────────────────────────────
  addTag(): void {
    const tag = this.newTagInput().trim();
    const cust = this.customer();
    if (!cust || !tag) return;

    this.dataService.addCustomerTag(cust.id, tag);
    this.newTagInput.set('');
    this.toastService.success(`Tag "${tag}" added.`);
  }

  removeTag(tag: string): void {
    const cust = this.customer();
    if (!cust) return;

    this.dataService.removeCustomerTag(cust.id, tag);
    this.toastService.info(`Tag "${tag}" removed.`);
  }

  // ── Edit Customer Modal ─────────────────────────────────────
  openEditModal(): void {
    const cust = this.customer();
    if (!cust) return;

    this.editName.set(cust.name);
    this.editEmail.set(cust.email);
    this.editPhone.set(cust.phone);
    this.editStatus.set(cust.status);
    this.editErrors.set({});
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editErrors.set({});
  }

  saveEditCustomer(): void {
    const errors: Record<string, string> = {};
    const name = this.editName().trim();
    const email = this.editEmail().trim();

    if (!name) errors['name'] = 'Customer name is required';
    if (!email) {
      errors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      this.editErrors.set(errors);
      return;
    }

    const cust = this.customer();
    if (!cust) return;

    this.dataService.updateCustomer(cust.id, {
      name,
      email,
      phone: this.editPhone().trim(),
      status: this.editStatus(),
    });

    this.toastService.success(`Customer profile updated successfully.`);
    this.closeEditModal();
  }

  // ── Add Address Modal ───────────────────────────────────────
  openAddressModal(): void {
    const cust = this.customer();
    if (!cust) return;

    this.addrLabel.set('Home');
    this.addrRecipient.set(cust.name);
    this.addrStreet.set('');
    this.addrCity.set('');
    this.addrCountry.set('Pakistan');
    this.addrPostalCode.set('');
    this.addrPhone.set(cust.phone);
    this.addrIsDefault.set(cust.addresses.length === 0);
    this.addrErrors.set({});
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal(): void {
    this.isAddressModalOpen.set(false);
    this.addrErrors.set({});
  }

  saveAddress(): void {
    const errors: Record<string, string> = {};
    const street = this.addrStreet().trim();
    const city = this.addrCity().trim();

    if (!street) errors['street'] = 'Street address is required';
    if (!city) errors['city'] = 'City is required';

    if (Object.keys(errors).length > 0) {
      this.addrErrors.set(errors);
      return;
    }

    const cust = this.customer();
    if (!cust) return;

    this.dataService.addCustomerAddress(cust.id, {
      label: this.addrLabel().trim() || 'Other',
      recipientName: this.addrRecipient().trim() || cust.name,
      street,
      city,
      country: this.addrCountry().trim() || 'Pakistan',
      postalCode: this.addrPostalCode().trim() || '44000',
      phone: this.addrPhone().trim() || cust.phone,
      isDefault: this.addrIsDefault(),
    });

    this.toastService.success(`New address saved for ${cust.name}.`);
    this.closeAddressModal();
  }

  // ── Delete Customer Modal ───────────────────────────────────
  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
  }

  executeDelete(): void {
    const cust = this.customer();
    if (!cust) return;

    this.dataService.deleteCustomer(cust.id);
    this.toastService.success(`Customer "${cust.name}" has been deleted.`);
    this.closeDeleteModal();
    this.router.navigate(['/admin/customers']);
  }
}
