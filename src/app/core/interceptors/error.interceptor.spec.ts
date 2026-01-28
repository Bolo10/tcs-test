import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../../shared/ui/toast/toast.service';

describe('errorInterceptor (fn)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const toast = {
    show: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toast },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    toast.show.mockClear();
  });

  afterEach(() => httpMock.verify());

  it('shows "Servidor no disponible" on status 0', () => {
    http.get('/bp/products').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products');
    req.error(new ProgressEvent('error'));

    expect(toast.show).toHaveBeenCalledWith('Servidor no disponible', 'error');
  });

  it('uses backend error.message when present', () => {
    http.get('/bp/products').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products');
    req.flush(
      { message: 'DuplicateIdentifier' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(toast.show).toHaveBeenCalledWith('DuplicateIdentifier', 'error');
  });

  it('shows "Solicitud inválida" on 400 when no backend message', () => {
    http.get('/bp/products').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products');
    req.flush({}, { status: 400, statusText: 'Bad Request' });

    expect(toast.show).toHaveBeenCalledWith('Solicitud inválida', 'error');
  });

  it('shows "Recurso no encontrado" on 404', () => {
    http.get('/bp/products/NO').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products/NO');
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(toast.show).toHaveBeenCalledWith('Recurso no encontrado', 'error');
  });

  it('shows "Error interno del servidor" on 500', () => {
    http.get('/bp/products').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(toast.show).toHaveBeenCalledWith(
      'Error interno del servidor',
      'error',
    );
  });

  it('shows default "Error inesperado" on other status', () => {
    http.get('/bp/products').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/bp/products');
    req.flush({}, { status: 418, statusText: "I'm a teapot" });

    expect(toast.show).toHaveBeenCalledWith('Error inesperado', 'error');
  });
});
