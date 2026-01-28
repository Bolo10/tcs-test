import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { ProductsApiService } from '../services/products-api.service';

export function uniqueProductIdValidator(
  api: ProductsApiService,
): AsyncValidatorFn {
  return (control) => {
    const id = (control.value ?? '').trim();
    if (!id) return of(null);

    return api.checkIdExists(id).pipe(
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of(null)),
    );
  };
}
