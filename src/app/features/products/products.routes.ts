import { Routes } from '@angular/router';
import { productsResolver } from './resolvers/products.resolver';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list-page/products-list-page.component').then(
        (m) => m.ProductsListPageComponent,
      ),
    resolve: { products: productsResolver },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/product-form-page/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
];
