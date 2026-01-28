import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let msg = 'Error inesperado';

      if (error.status === 0) msg = 'Servidor no disponible';
      else if (typeof error.error?.message === 'string')
        msg = error.error.message;
      else if (error.status === 400) msg = 'Solicitud inválida';
      else if (error.status === 404) msg = 'Recurso no encontrado';
      else if (error.status === 500) msg = 'Error interno del servidor';

      toast.show(msg, 'error');
      return throwError(() => error);
    }),
  );
};
