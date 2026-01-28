import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ProductsApiService } from '../services/products-api.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { productsResolver } from './products.resolver';
import { Product } from '../models/product.model';

describe('productsResolver', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  it('returns products from api.getAll()', (done) => {
    const api = {
      getAll: jest.fn(() => of([{ id: 'P1' }, { id: 'P2' }] as any)),
    };
    const toast = { show: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ProductsApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = productsResolver(route, state) as unknown as Observable<
        Product[]
      >;

      result.subscribe((data) => {
        expect(api.getAll).toHaveBeenCalled();
        expect(data).toHaveLength(2);
        expect(toast.show).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('shows toast and returns [] when api fails', (done) => {
    const api = { getAll: jest.fn(() => throwError(() => new Error('boom'))) };
    const toast = { show: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ProductsApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const result = productsResolver(route, state) as unknown as Observable<
        Product[]
      >;

      result.subscribe((data) => {
        expect(api.getAll).toHaveBeenCalled();
        expect(data).toEqual([]);
        expect(toast.show).toHaveBeenCalledWith(
          'No se pudieron cargar los productos',
          'error',
        );
        done();
      });
    });
  });
});
