import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminMockDataService,
  AdminGeneralSettings,
  AdminShippingSettings,
  AdminPaymentSettings,
  AdminTaxSettings,
  AdminTeamUser,
  AdminNotificationSettings,
  AdminUserRole,
} from '../../services/admin-mock-data.service';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

export type SettingsTab =
  | 'general'
  | 'shipping'
  | 'payment'
  | 'tax'
  | 'users'
  | 'notifications';

export interface SettingsTabItem {
  id: SettingsTab;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'gp-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminModalComponent,
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit {
  private readonly mockData = inject(AdminMockDataService);
  private readonly toastService = inject(AdminToastService);

  readonly tabs: SettingsTabItem[] = [
    {
      id: 'general',
      label: 'General Store Info',
      shortLabel: 'General',
      description: 'Store identity, address & localization',
      icon: 'store',
    },
    {
      id: 'shipping',
      label: 'Shipping Settings',
      shortLabel: 'Shipping',
      description: 'Delivery zones, rates & couriers',
      icon: 'truck',
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      shortLabel: 'Payments',
      description: 'COD, Cards, Wallets & Bank wire',
      icon: 'card',
    },
    {
      id: 'tax',
      label: 'Tax Settings',
      shortLabel: 'Taxes',
      description: 'VAT / GST rates & tax registration',
      icon: 'receipt',
    },
    {
      id: 'users',
      label: 'Admin Users & Roles',
      shortLabel: 'Team',
      description: 'Staff accounts, roles & permissions',
      icon: 'users',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      shortLabel: 'Notifications',
      description: 'Email alerts, customer notices & SMS',
      icon: 'bell',
    },
  ];

  // Active section state
  activeTab = signal<SettingsTab>('general');
  isDirty = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form states
  generalForm = signal<AdminGeneralSettings>({} as AdminGeneralSettings);
  shippingForm = signal<AdminShippingSettings>({} as AdminShippingSettings);
  paymentForm = signal<AdminPaymentSettings>({} as AdminPaymentSettings);
  taxForm = signal<AdminTaxSettings>({} as AdminTaxSettings);
  teamUsers = signal<AdminTeamUser[]>([]);
  notificationForm = signal<AdminNotificationSettings>({} as AdminNotificationSettings);

  // Key mask state
  showStripeKey = signal<boolean>(false);

  // Team user modal
  showInviteModal = signal<boolean>(false);
  inviteForm = signal<{
    name: string;
    email: string;
    phone: string;
    role: AdminUserRole;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'Store Manager',
  });

  // Active tab item helper
  activeTabItem = computed(() => {
    const current = this.activeTab();
    return this.tabs.find(t => t.id === current) || this.tabs[0];
  });

  ngOnInit(): void {
    this.loadAllSettings();
  }

  loadAllSettings(): void {
    this.generalForm.set(this.mockData.getGeneralSettings());
    this.shippingForm.set(this.mockData.getShippingSettings());
    this.paymentForm.set(this.mockData.getPaymentSettings());
    this.taxForm.set(this.mockData.getTaxSettings());
    this.teamUsers.set(this.mockData.getAdminUsers());
    this.notificationForm.set(this.mockData.getNotificationSettings());
    this.isDirty.set(false);
  }

  selectTab(tab: SettingsTab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    // Reload active tab state from persistence to reset any pending dirty edits
    this.loadActiveTab(tab);
    this.isDirty.set(false);
  }

  onMobileSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.selectTab(target.value as SettingsTab);
    }
  }

  markDirty(): void {
    this.isDirty.set(true);
  }

  loadActiveTab(tab: SettingsTab): void {
    switch (tab) {
      case 'general':
        this.generalForm.set(this.mockData.getGeneralSettings());
        break;
      case 'shipping':
        this.shippingForm.set(this.mockData.getShippingSettings());
        break;
      case 'payment':
        this.paymentForm.set(this.mockData.getPaymentSettings());
        break;
      case 'tax':
        this.taxForm.set(this.mockData.getTaxSettings());
        break;
      case 'users':
        this.teamUsers.set(this.mockData.getAdminUsers());
        break;
      case 'notifications':
        this.notificationForm.set(this.mockData.getNotificationSettings());
        break;
    }
  }

  saveChanges(): void {
    this.isSaving.set(true);
    const tab = this.activeTab();

    setTimeout(() => {
      switch (tab) {
        case 'general':
          this.mockData.updateGeneralSettings(this.generalForm());
          break;
        case 'shipping':
          this.mockData.updateShippingSettings(this.shippingForm());
          break;
        case 'payment':
          this.mockData.updatePaymentSettings(this.paymentForm());
          break;
        case 'tax':
          this.mockData.updateTaxSettings(this.taxForm());
          break;
        case 'notifications':
          this.mockData.updateNotificationSettings(this.notificationForm());
          break;
        case 'users':
          // Users are saved instantly on action
          break;
      }

      this.isSaving.set(false);
      this.isDirty.set(false);
      this.toastService.success(`${this.activeTabItem().label} saved successfully.`);
    }, 450);
  }

  discardChanges(): void {
    this.loadActiveTab(this.activeTab());
    this.isDirty.set(false);
    this.toastService.info('Unsaved changes discarded.');
  }

  // Toggle courier active
  toggleCourier(index: number): void {
    this.shippingForm.update(prev => {
      const couriers = [...prev.couriers];
      couriers[index] = { ...couriers[index], enabled: !couriers[index].enabled };
      return { ...prev, couriers };
    });
    this.markDirty();
  }

  togglePasswordVisibility(): void {
    this.showStripeKey.update(v => !v);
  }

  // Team user management
  openInviteModal(): void {
    this.inviteForm.set({
      name: '',
      email: '',
      phone: '',
      role: 'Store Manager',
    });
    this.showInviteModal.set(true);
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
  }

  submitInviteUser(): void {
    const data = this.inviteForm();
    if (!data.name.trim() || !data.email.trim()) {
      this.toastService.error('Please enter name and valid email address.');
      return;
    }

    const created = this.mockData.addAdminUser({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim() || undefined,
      role: data.role,
      status: 'Invited',
    });

    this.teamUsers.set(this.mockData.getAdminUsers());
    this.closeInviteModal();
    this.toastService.success(`Invitation sent to ${created.email}`);
  }

  toggleUserStatus(user: AdminTeamUser): void {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    this.mockData.updateAdminUser(user.id, { status: newStatus });
    this.teamUsers.set(this.mockData.getAdminUsers());
    this.toastService.success(`${user.name} status updated to ${newStatus}.`);
  }

  deleteUser(user: AdminTeamUser): void {
    if (user.role === 'Super Admin') {
      this.toastService.error('Super Admin user cannot be removed.');
      return;
    }
    const confirmed = confirm(`Are you sure you want to remove ${user.name} from the admin team?`);
    if (confirmed) {
      this.mockData.deleteAdminUser(user.id);
      this.teamUsers.set(this.mockData.getAdminUsers());
      this.toastService.success(`${user.name} removed from admin team.`);
    }
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
