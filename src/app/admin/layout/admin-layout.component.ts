import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  HostListener,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AdminToastComponent } from '../shared/components/admin-toast/admin-toast.component';
import { AdminToastService } from '../shared/services/admin-toast.service';

export interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  exact?: boolean;
}

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'order' | 'inventory' | 'payment' | 'review';
}

@Component({
  selector: 'gp-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminToastComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(AdminToastService);
  private readonly elementRef = inject(ElementRef);

  // Responsive & Collapse Signals
  readonly isSidebarCollapsed = signal<boolean>(false);
  readonly isMobileSidebarOpen = signal<boolean>(false);

  // Dropdown States
  readonly isNotificationsOpen = signal<boolean>(false);
  readonly isProfileMenuOpen = signal<boolean>(false);

  // Search State
  readonly searchQuery = signal<string>('');

  // Active Route / Breadcrumb State
  readonly currentUrl = signal<string>('/admin');

  // Navigation Items (10 Items as requested)
  readonly navItems: AdminNavItem[] = [
    { label: 'Dashboard', route: '/admin', icon: 'dashboard', exact: true },
    { label: 'Products', route: '/admin/products', icon: 'products' },
    { label: 'Orders', route: '/admin/orders', icon: 'orders', badge: '12' },
    { label: 'Customers', route: '/admin/customers', icon: 'customers' },
    { label: 'Categories', route: '/admin/categories', icon: 'categories' },
    { label: 'Inventory', route: '/admin/inventory', icon: 'inventory' },
    { label: 'Discounts', route: '/admin/discounts', icon: 'discounts', badge: 'NEW' },
    { label: 'Reviews', route: '/admin/reviews', icon: 'reviews' },
    { label: 'Reports', route: '/admin/reports', icon: 'reports' },
    { label: 'Settings', route: '/admin/settings', icon: 'settings' }
  ];

  // Mock Notifications
  readonly notifications = signal<AdminNotification[]>([
    {
      id: 'n1',
      title: 'New Order #ORD-9842',
      description: 'Ahmad Khan placed an order for $349.99 (2 items)',
      time: '5m ago',
      read: false,
      type: 'order'
    },
    {
      id: 'n2',
      title: 'Low Stock Alert',
      description: 'BenQ ScreenBar Pro has only 2 units remaining in warehouse',
      time: '25m ago',
      read: false,
      type: 'inventory'
    },
    {
      id: 'n3',
      title: 'Payment Confirmed',
      description: 'JazzCash verified payment of $129.50 for #ORD-9841',
      time: '1h ago',
      read: false,
      type: 'payment'
    },
    {
      id: 'n4',
      title: 'New 5★ Product Review',
      description: 'Hamza A. reviewed Sony WH-1000XM5: "Best ANC headphones!"',
      time: '3h ago',
      read: true,
      type: 'review'
    }
  ]);

  // Unread notifications counter
  readonly unreadNotificationsCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  // Current Breadcrumb Trail
  readonly currentBreadcrumbs = computed(() => {
    const url = this.currentUrl();
    const segments = url.split('/').filter(Boolean); // e.g. ['admin', 'orders']

    const crumbs: { label: string; route?: string }[] = [
      { label: 'Admin', route: '/admin' }
    ];

    if (segments.length > 1) {
      const sub = segments[1];
      const match = this.navItems.find(i => i.route === `/admin/${sub}`);
      const label = match ? match.label : sub.charAt(0).toUpperCase() + sub.slice(1);
      crumbs.push({ label });
    } else {
      crumbs.push({ label: 'Dashboard' });
    }

    return crumbs;
  });

  constructor() {
    this.initSidebarState();

    // Listen to router navigation to update breadcrumbs & close mobile drawer
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.isMobileSidebarOpen.set(false);
        this.isNotificationsOpen.set(false);
        this.isProfileMenuOpen.set(false);
      });
  }

  private initSidebarState(): void {
    if (typeof window === 'undefined') return;

    // Check stored preference
    const stored = localStorage.getItem('gp_admin_sidebar_collapsed');
    if (stored !== null) {
      this.isSidebarCollapsed.set(stored === 'true');
    } else {
      // Default collapsed on tablet (640px - 1023px)
      const width = window.innerWidth;
      if (width >= 640 && width < 1024) {
        this.isSidebarCollapsed.set(true);
      }
    }

    this.currentUrl.set(window.location.pathname);
  }

  // ── Sidebar Collapse Toggle ───────────────────────────────────
  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed.update(collapsed => {
      const next = !collapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gp_admin_sidebar_collapsed', String(next));
      }
      return next;
    });
  }

  // ── Mobile Drawer Toggle ──────────────────────────────────────
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(open => !open);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  // ── Notifications Dropdown ───────────────────────────────────
  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationsOpen.update(v => !v);
    this.isProfileMenuOpen.set(false);
  }

  markAllNotificationsAsRead(): void {
    this.notifications.update(items => items.map(i => ({ ...i, read: true })));
    this.toastService.success('All notifications marked as read', 'Notifications');
  }

  // ── Profile Dropdown ─────────────────────────────────────────
  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update(v => !v);
    this.isNotificationsOpen.set(false);
  }

  // ── Search Handling ──────────────────────────────────────────
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  executeSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.toastService.info(`Searching for "${q}" across orders & products...`, 'Global Search');
    }
  }

  // ── Profile Actions ──────────────────────────────────────────
  onLogout(): void {
    this.isProfileMenuOpen.set(false);
    this.toastService.info('You have logged out of the Admin session', 'Session Ended');
    this.router.navigate(['/login']);
  }

  // ── Click Outside Listener ───────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-wrapper')) {
      this.isNotificationsOpen.set(false);
    }
    if (!target.closest('.profile-menu-wrapper')) {
      this.isProfileMenuOpen.set(false);
    }
  }
}
