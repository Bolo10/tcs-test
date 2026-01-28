import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ProductsApiService } from '../services/products-api.service';
import { Product } from '../models/product.model';
import { ToastService } from '../../../shared/ui/toast/toast.service';

export const productsResolver: ResolveFn<Product[]> = () => {
  const api = inject(ProductsApiService);
  const toast = inject(ToastService);


  return api.getAll().pipe(

    catchError((err) => {
      toast.show('No se pudieron cargar los productos', 'error');
      return of([] as Product[]);
    }),
  );
};
