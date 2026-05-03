import { Routes }     from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/components/product-list.component')
        .then(m => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/components/product-detail.component')
        .then(m => m.ProductDetailComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/components/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/components/register.component')
        .then(m => m.RegisterComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component')
        .then(m => m.CheckoutComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/components/order-list.component')
        .then(m => m.OrderListComponent),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/components/order-detail.component')
        .then(m => m.OrderDetailComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent),
  },
  { path: '**', redirectTo: '' },
];
