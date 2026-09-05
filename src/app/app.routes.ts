import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'GadgetPlanet — Your Universe of Premium Gadgets',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/product-listing/product-listing.component').then(
        m => m.ProductListingComponent
      ),
    title: 'Products — GadgetPlanet',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      ),
    title: 'Product Detail — GadgetPlanet',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Shopping Cart — GadgetPlanet',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
