import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductFormPageComponent } from './product-form-page.component';
import { ProductsApiService } from '../../services/products-api.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

describe('ProductFormPageComponent (Jest)', () => {
  let fixture: ComponentFixture<ProductFormPageComponent>;
  let component: ProductFormPageComponent;


  const apiMock = {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<ProductsApiService>;

  const routerMock = {
    navigate: jest.fn(),
    navigateByUrl: jest.fn(),
  } as unknown as jest.Mocked<Router>;

  const toastMock = {
    show: jest.fn(),
  } as unknown as jest.Mocked<ToastService>;

  const makeRoute = (id: string | null) =>
    ({
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? id : null),
        },
      },
    }) as unknown as ActivatedRoute;

  async function setup(id: string | null = null) {
    await TestBed.configureTestingModule({
      imports: [ProductFormPageComponent],
      providers: [
        { provide: ProductsApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastMock },
        { provide: ActivatedRoute, useValue: makeRoute(id) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', async () => {
    await setup(null);
    expect(component).toBeTruthy();
  });

  it('should be create mode when route id is null', async () => {
    await setup(null);
    expect(component.isEdit()).toBe(false);
    expect(component.form.controls.id.enabled).toBe(true);
  });

  it('should be edit mode when route id exists and disable id control', async () => {
    apiMock.getById = jest.fn().mockReturnValue(
      of({
        id: 'P001',
        name: 'Producto edit',
        description: 'Descripción larga de producto edit',
        logo: 'https://logo.com/x.png',
        date_release: '2026-01-01',
        date_revision: '2027-01-01',
      }),
    );

    await setup('P001');

    expect(component.isEdit()).toBe(true);
    expect(component.form.controls.id.disabled).toBe(true);
    expect(apiMock.getById).toHaveBeenCalledWith('P001');

    expect(component.form.getRawValue().id).toBe('P001');
    expect(component.form.controls.name.value).toBe('Producto edit');
  });

  it('should set loadError when getById fails in edit mode', async () => {
    apiMock.getById = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('boom')));

    await setup('P001');

    expect(component.loadError()).toBe(
      'Producto no encontrado o error cargando producto',
    );
  });

  it('should auto-calculate date_revision = date_release + 1 year', async () => {
    await setup(null);

    component.form.controls.date_release.setValue('2026-01-28');

    tick(0);

    expect(component.form.controls.date_revision.value).toBe('2027-01-28');
  });

  it('should update nameCount and descCount as user types', async () => {
    await setup(null);

    component.form.controls.name.setValue('ABCDE');
    component.form.controls.description.setValue('0123456789');
    tick(0);

    expect(component.nameCount()).toBe(5);
    expect(component.descCount()).toBe(10);
  });

  it('showErr should return true when control touched and invalid', async () => {
    await setup(null);

    const name = component.form.controls.name;
    name.setValue('a');
    name.markAsTouched();

    expect(component.showErr('name' as any)).toBe(true);
  });

  it('reset() in create mode should reset form and show toast', async () => {
    await setup(null);

    component.form.controls.name.setValue('Producto válido');
    component.reset();

    expect(toastMock.show).toHaveBeenCalledWith('Formulario reiniciado');
    expect(component.submitAttempted()).toBe(false);
    expect(component.form.controls.date_revision.value).toBe('');
  });

  it('reset() in edit mode should block reset and show toast', async () => {
    apiMock.getById = jest.fn().mockReturnValue(
      of({
        id: 'P001',
        name: 'Producto edit',
        description: 'Descripción larga de producto edit',
        logo: 'https://logo.com/x.png',
        date_release: '2026-01-01',
        date_revision: '2027-01-01',
      }),
    );

    await setup('P001');

    component.reset();

    expect(toastMock.show).toHaveBeenCalledWith(
      'Es una edición no puedes reiniciar el formulario',
    );
  });

  it('submit() should mark touched and not call api when form is invalid', async () => {
    await setup(null);

    component.form.controls.name.setValue('a');
    component.submit();

    expect(apiMock.create).not.toHaveBeenCalled();
    expect(apiMock.update).not.toHaveBeenCalled();
    expect(component.submitAttempted()).toBe(true);
  });

  it('submit() in create mode should call api.create and navigate on success', fakeAsync(async () => {
    apiMock.create = jest.fn().mockReturnValue(of({ message: 'Creado OK' }));

    await setup(null);

    component.form.setValue({
      id: 'ABC',
      name: 'Producto válido',
      description: 'Descripción válida 12345',
      logo: 'https://logo.com/a.png',
      date_release: '2026-01-28',
      date_revision: '2027-01-28',
    });

    component.submit();
    tick(0);

    expect(apiMock.create).toHaveBeenCalled();
    expect(toastMock.show).toHaveBeenCalledWith('Creado OK', 'success');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
    expect(component.saving()).toBe(false);
  }));

  it('submit() in edit mode should call api.update with id disabled', fakeAsync(async () => {
    apiMock.getById = jest.fn().mockReturnValue(
      of({
        id: 'P001',
        name: 'Producto edit',
        description: 'Descripción larga de producto edit',
        logo: 'https://logo.com/x.png',
        date_release: '2026-01-01',
        date_revision: '2027-01-01',
      }),
    );

    apiMock.update = jest
      .fn()
      .mockReturnValue(of({ message: 'Actualizado OK' }));

    await setup('P001');

    component.form.controls.name.setValue('Producto editado');
    component.form.controls.description.setValue(
      'Descripción larga de producto editado',
    );
    component.form.controls.logo.setValue('https://logo.com/y.png');
    component.form.controls.date_release.setValue('2026-02-01');

    tick(0);

    component.submit();
    tick(0);

    expect(apiMock.update).toHaveBeenCalled();
    const [idArg, payloadArg] = (apiMock.update as jest.Mock).mock.calls[0];

    expect(idArg).toBe('P001');
    expect(payloadArg.id).toBe('P001');

    expect(toastMock.show).toHaveBeenCalledWith('Actualizado OK', 'success');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('submit() should show error toast when api fails', fakeAsync(async () => {
    apiMock.create = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('fail')));

    await setup(null);

    component.form.setValue({
      id: 'ABC',
      name: 'Producto válido',
      description: 'Descripción válida 12345',
      logo: 'https://logo.com/a.png',
      date_release: '2026-01-28',
      date_revision: '2027-01-28',
    });

    component.submit();
    tick(0);

    expect(toastMock.show).toHaveBeenCalledWith(
      'No se pudo guardar el producto',
      'error',
    );
    expect(component.saving()).toBe(false);
  }));

  it('goBack() should navigate to /products', async () => {
    await setup(null);
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('loading should become false after 2 seconds', fakeAsync(async () => {
    await setup(null);

    expect(component.loading()).toBe(true);

    tick(2000);
    expect(component.loading()).toBe(false);
  }));
});
