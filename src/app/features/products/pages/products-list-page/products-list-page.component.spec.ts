import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductsListPageComponent } from './products-list-page.component';
import { ProductsApiService } from '../../services/products-api.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

describe('ProductsListPageComponent', () => {
  const mockProducts = [
    {
      id: 'P001',
      name: 'Alpha',
      description: 'First',
      logo: '',
      date_release: '2025-01-28',
      date_revision: '2026-01-28',
    },
    {
      id: 'P002',
      name: 'Beta',
      description: 'Second',
      logo: '',
      date_release: '2025-01-28',
      date_revision: '2026-01-28',
    },
    {
      id: 'X999',
      name: 'Gamma',
      description: 'Something else',
      logo: '',
      date_release: '2025-01-28',
      date_revision: '2026-01-28',
    },
  ] as any[];

  let router: { navigate: jest.Mock };
  let api: { delete: jest.Mock };
  let toast: { show: jest.Mock };

  beforeEach(async () => {
    router = { navigate: jest.fn() };
    api = { delete: jest.fn() };
    toast = { show: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductsListPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { products: mockProducts } },
          },
        },
        { provide: Router, useValue: router },
        { provide: ProductsApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(ProductsListPageComponent);
    const comp = fixture.componentInstance;
    return { fixture, comp };
  }

  it('should create', () => {
    const { comp } = create();
    expect(comp).toBeTruthy();
  });

  it('ngOnInit sets loading=false after 2s', fakeAsync(() => {
    const { comp } = create();
    expect(comp.loading()).toBe(true);

    comp.ngOnInit();
    tick(1999);
    expect(comp.loading()).toBe(true);

    tick(1);
    expect(comp.loading()).toBe(false);
  }));

  it('filtered returns all when search is empty', () => {
    const { comp } = create();
    comp.search.set('');
    expect(comp.filtered().length).toBe(3);
  });

  it('filtered matches id, name, description case-insensitive', () => {
    const { comp } = create();

    comp.search.set('p001');
    expect(comp.filtered().map((p) => p.id)).toEqual(['P001']);

    comp.search.set('beta');
    expect(comp.filtered().map((p) => p.id)).toEqual(['P002']);

    comp.search.set('something');
    expect(comp.filtered().map((p) => p.id)).toEqual(['X999']);
  });

  it('visible returns first N based on pageSize', () => {
    const { comp } = create();
    comp.pageSize.set(5);
    expect(comp.visible().length).toBe(3);


    comp.products.set(
      Array.from({ length: 10 }).map((_, i) => ({
        id: `P${i}`,
        name: `N${i}`,
        description: `D${i}`,
      })) as any,
    );

    comp.pageSize.set(5);
    expect(comp.visible().length).toBe(5);

    comp.pageSize.set(10);
    expect(comp.visible().length).toBe(10);
  });

  it('goNew navigates to /products/new', () => {
    const { comp } = create();
    comp.goNew();
    expect(router.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('toggleMenu toggles openMenuId between id and null', () => {
    const { comp } = create();

    comp.toggleMenu('P001');
    expect(comp.openMenuId()).toBe('P001');

    comp.toggleMenu('P001');
    expect(comp.openMenuId()).toBeNull();

    comp.toggleMenu('P002');
    expect(comp.openMenuId()).toBe('P002');
  });

  it('edit closes menu and navigates to edit route', () => {
    const { comp } = create();
    comp.openMenuId.set('P001');

    comp.edit(mockProducts[0] as any);

    expect(comp.openMenuId()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/products', 'P001', 'edit']);
  });

  it('openDelete sets deleteTarget and closes menu; closeDelete clears target', () => {
    const { comp } = create();
    comp.openMenuId.set('P001');

    comp.openDelete(mockProducts[0] as any);
    expect(comp.openMenuId()).toBeNull();
    expect(comp.deleteTarget()?.id).toBe('P001');
    expect(comp.dialogOpen()).toBe(true);
    expect(comp.dialogTitle()).toContain('Alpha');

    comp.closeDelete();
    expect(comp.deleteTarget()).toBeNull();
    expect(comp.dialogOpen()).toBe(false);
    expect(comp.dialogTitle()).toBe('');
  });

  it('setPageSizeFromEvent sets pageSize only for 5/10/20', () => {
    const { comp } = create();

    const mkEvent = (value: any) =>
      ({ target: { value: String(value) } }) as unknown as Event;

    comp.pageSize.set(5);
    comp.setPageSizeFromEvent(mkEvent(10));
    expect(comp.pageSize()).toBe(10);

    comp.setPageSizeFromEvent(mkEvent(20));
    expect(comp.pageSize()).toBe(20);

    comp.setPageSizeFromEvent(mkEvent(15));
    expect(comp.pageSize()).toBe(20);
  });

  it('confirmDelete success: removes product, closes dialog and shows success toast', () => {
    const { comp } = create();

    api.delete.mockReturnValue(of({ message: 'Product removed successfully' }));

    comp.openDelete(mockProducts[0] as any);
    expect(comp.deleteTarget()?.id).toBe('P001');

    comp.confirmDelete('P001');

    expect(api.delete).toHaveBeenCalledWith('P001');
    expect(comp.products().some((p) => p.id === 'P001')).toBe(false);
    expect(comp.deleteTarget()).toBeNull();
    expect(toast.show).toHaveBeenCalledWith(
      'Product removed successfully',
      'success',
    );
  });

  it('confirmDelete error: closes dialog and shows error toast', () => {
    const { comp } = create();

    api.delete.mockReturnValue(throwError(() => new Error('boom')));

    comp.openDelete(mockProducts[0] as any);
    comp.confirmDelete('P001');

    expect(comp.deleteTarget()).toBeNull();
    expect(toast.show).toHaveBeenCalledWith(
      'No se pudo eliminar el producto',
      'error',
    );
  });
});
