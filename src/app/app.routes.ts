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
    path: 'category/:slug',
    loadComponent: () =>
      import('./features/product-listing/product-listing.component').then(
        m => m.ProductListingComponent
      ),
    title: 'Category — GadgetPlanet',
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      ),
    title: 'Product Detail — GadgetPlanet',
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
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(
        m => m.WishlistComponent
      ),
    title: 'My Wishlist — GadgetPlanet',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Sign In — GadgetPlanet',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Create Account — GadgetPlanet',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(
        m => m.CheckoutComponent
      ),
    title: 'Checkout — GadgetPlanet',
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/pages/about/about.component').then(
        m => m.AboutComponent
      ),
    title: 'About Us — GadgetPlanet',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/pages/contact/contact.component').then(
        m => m.ContactComponent
      ),
    title: 'Contact Support — GadgetPlanet',
  },
  {
    path: 'track-order',
    loadComponent: () =>
      import('./features/pages/track-order/track-order.component').then(
        m => m.TrackOrderComponent
      ),
    title: 'Track Your Order — GadgetPlanet',
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./features/pages/faq/faq.component').then(m => m.FaqComponent),
    title: 'FAQs & Help Center — GadgetPlanet',
  },
  {
    path: 'warranty-policy',
    loadComponent: () =>
      import('./features/pages/warranty-policy/warranty-policy.component').then(
        m => m.WarrantyPolicyComponent
      ),
    title: 'Warranty & Return Policy — GadgetPlanet',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
