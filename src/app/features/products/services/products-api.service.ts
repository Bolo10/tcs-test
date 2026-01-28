import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiListResponse, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getAll(): Observable<Product[]> {
    return this.http
      .get<ApiListResponse<Product[]>>(`${this.baseUrl}/bp/products`)
      .pipe(map((res) => res.data ?? []));
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/bp/products/${id}`);
  }

  checkIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/bp/products/verification/${id}`,
    );
  }

  create(payload: Product): Observable<{ message: string; data: Product }> {
    return this.http.post<{ message: string; data: Product }>(
      `${this.baseUrl}/bp/products`,
      payload,
    );
  }

  update(
    id: string,
    payload: Product,
  ): Observable<{ message: string; data: Product }> {
    return this.http.put<{ message: string; data: Product }>(
      `${this.baseUrl}/bp/products/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/bp/products/${id}`,
    );
  }
}
