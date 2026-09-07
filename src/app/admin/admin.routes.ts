import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Admin Dashboard — GadgetPlanet',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Admin Dashboard — GadgetPlanet',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/admin-products.component').then(
            m => m.AdminProductsComponent
          ),
        title: 'Products — GadgetPlanet Admin',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import(
            './features/products/product-edit/admin-product-edit.component'
          ).then(m => m.AdminProductEditComponent),
        title: 'New Product — GadgetPlanet Admin',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import(
            './features/products/product-edit/admin-product-edit.component'
          ).then(m => m.AdminProductEditComponent),
        title: 'Edit Product — GadgetPlanet Admin',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/admin-orders.component').then(
            m => m.AdminOrdersComponent
          ),
        title: 'Orders — GadgetPlanet Admin',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import(
            './features/orders/order-detail/admin-order-detail.component'
          ).then(m => m.AdminOrderDetailComponent),
        title: 'Order Details — GadgetPlanet Admin',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/admin-customers.component').then(
            m => m.AdminCustomersComponent
          ),
        title: 'Customers — GadgetPlanet Admin',
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import(
            './features/customers/customer-detail/admin-customer-detail.component'
          ).then(m => m.AdminCustomerDetailComponent),
        title: 'Customer Details — GadgetPlanet Admin',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/admin-categories.component').then(
            m => m.AdminCategoriesComponent
          ),
        title: 'Categories — GadgetPlanet Admin',
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/admin-inventory.component').then(
            m => m.AdminInventoryComponent
          ),
        title: 'Inventory — GadgetPlanet Admin',
      },
      {
        path: 'discounts',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Discounts & Coupons — GadgetPlanet Admin',
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Customer Reviews — GadgetPlanet Admin',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Analytics & Reports — GadgetPlanet Admin',
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Analytics & Reports — GadgetPlanet Admin',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Settings — GadgetPlanet Admin',
      },
    ],
  },
];
