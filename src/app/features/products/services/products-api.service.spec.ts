import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll() should GET /bp/products and return data[]', () => {
    service.getAll().subscribe((items) => {
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('P001');
    });

    const req = http.expectOne(
      (r) => r.method === 'GET' && r.url.includes('/bp/products'),
    );
    req.flush({ data: [{ id: 'P001' }, { id: 'P002' }] });
  });

  it('verifyIdentifier(id) should GET /bp/products/verification/:id', () => {
    service.checkIdExists('P001').subscribe((exists) => {
      expect(exists).toBe(true);
    });

    const req = http.expectOne(
      (r) =>
        r.method === 'GET' && r.url.includes('/bp/products/verification/P001'),
    );
    req.flush(true);
  });

  it('getById(id) should GET /bp/products/:id', () => {
    service.getById('P009').subscribe((p: any) => {
      expect(p.id).toBe('P009');
    });

    const req = http.expectOne(
      (r) => r.method === 'GET' && r.url.includes('/bp/products/P009'),
    );
    req.flush({ id: 'P009' });
  });

  it('create(payload) should POST /bp/products', () => {
    const payload: any = { id: 'P010', name: 'X' };

    service.create(payload).subscribe((res: any) => {
      expect(res.data.id).toBe('P010');
    });

    const req = http.expectOne(
      (r) => r.method === 'POST' && r.url.includes('/bp/products'),
    );
    expect(req.request.body.id).toBe('P010');
    req.flush({ message: 'Product added successfully', data: payload });
  });

  it('update(id,payload) should PUT /bp/products/:id', () => {
    const payload: any = { name: 'Updated' };

    service.update('P010', payload).subscribe((res: any) => {
      expect(res.message).toBeTruthy();
    });

    const req = http.expectOne(
      (r) => r.method === 'PUT' && r.url.includes('/bp/products/P010'),
    );
    expect(req.request.body.name).toBe('Updated');
    req.flush({ message: 'Product updated successfully', data: payload });
  });

  it('remove(id) should DELETE /bp/products/:id', () => {
    service.delete('P010').subscribe((res: any) => {
      expect(res.message).toBeTruthy();
    });

    const req = http.expectOne(
      (r) => r.method === 'DELETE' && r.url.includes('/bp/products/P010'),
    );
    req.flush({ message: 'Product removed successfully' });
  });
});
