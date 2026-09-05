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
        path: 'products',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Products — GadgetPlanet Admin',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Orders — GadgetPlanet Admin',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Customers — GadgetPlanet Admin',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          ),
        title: 'Categories — GadgetPlanet Admin',
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
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
