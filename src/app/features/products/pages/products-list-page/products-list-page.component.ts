import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductsApiService } from '../../services/products-api.service';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './products-list-page.component.html',
  styleUrls: ['./products-list-page.component.css'],
})
export class ProductsListPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ProductsApiService);
  private toast = inject(ToastService);

  loading = signal(true);

  ngOnInit() {
    window.setTimeout(() => this.loading.set(false), 2000);
  }

  search = signal('');
  pageSize = signal<5 | 10 | 20>(5);


  products = signal<Product[]>(this.route.snapshot.data['products'] ?? []);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const items = this.products();
    if (!q) return items;
    return items.filter((p) =>
      [p.id, p.name, p.description].some((v) =>
        (v ?? '').toLowerCase().includes(q),
      ),
    );
  });

  visible = computed(() => this.filtered().slice(0, this.pageSize()));
  totalCount = computed(() => this.filtered().length);

  goNew() {
    this.router.navigate(['/products/new']);
  }


  openMenuId = signal<string | null>(null);
  deleteTarget = signal<Product | null>(null);

  toggleMenu(id: string) {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  edit(p: Product) {
    this.openMenuId.set(null);
    this.router.navigate(['/products', p.id, 'edit']);
  }

  openDelete(p: Product) {
    this.openMenuId.set(null);
    this.deleteTarget.set(p);
  }

  closeDelete() {
    this.deleteTarget.set(null);
  }

  confirmDelete(id: string) {
    this.api.delete(id).subscribe({
      next: (res) => {
        this.products.set(this.products().filter((p) => p.id !== id));
        this.deleteTarget.set(null);
        this.toast.show(res?.message ?? 'Producto eliminado', 'success');
      },
      error: (err) => {
        this.deleteTarget.set(null);
        this.toast.show('No se pudo eliminar el producto', 'error');
      },
    });
  }

  dialogOpen = computed(() => !!this.deleteTarget());
  dialogTitle = computed(() => {
    const t = this.deleteTarget();
    return t ? `¿Estas seguro de eliminar el producto ${t.name}?` : '';
  });

  setPageSizeFromEvent(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    if (value === 5 || value === 10 || value === 20) {
      this.pageSize.set(value);
    }
  }
}
