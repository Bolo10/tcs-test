import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsApiService } from '../../services/products-api.service';
import { Product } from '../../models/product.model';
import {
  releaseNotBeforeToday,
  revisionIsPlusOneYear,
} from '../../validators/date.validators';
import { uniqueProductIdValidator } from '../../validators/unique-id.validator';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form-page.component.html',
  styleUrls: ['./product-form-page.component.css'],
})
export class ProductFormPageComponent {
  private fb = inject(FormBuilder);
  private api = inject(ProductsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  routeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.routeId());

  saving = signal(false);
  submitAttempted = signal(false);
  loadError = signal<string | null>(null);

  loading = signal(true);

  nameCount = signal(0);
  descCount = signal(0);

  form = this.fb.group(
    {
      id: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        asyncValidators: [],
        updateOn: 'blur',
      }),
      name: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      }),
      description: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      }),
      logo: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      date_release: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, releaseNotBeforeToday],
      }),
      date_revision: this.fb.control(
        { value: '', disabled: true },
        { nonNullable: true, validators: [Validators.required] },
      ),
    },
    { validators: [revisionIsPlusOneYear] },
  );

  ngOnInit() {
    window.setTimeout(() => this.loading.set(false), 2000);

    this.form.controls.date_release.valueChanges.subscribe((v) => {
      const release = v;
      if (!release) {
        this.form.controls.date_revision.setValue('');
        return;
      }
      const d = new Date(release + 'T00:00:00');
      d.setFullYear(d.getFullYear() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      this.form.controls.date_revision.setValue(`${yyyy}-${mm}-${dd}`);
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });

    if (!this.isEdit()) {
      this.form.controls.id.addAsyncValidators(
        uniqueProductIdValidator(this.api),
      );
      this.form.controls.id.updateValueAndValidity();
    } else {
      this.form.controls.id.disable({ emitEvent: false });
      const id = this.routeId()!;

      this.api.getById(id).subscribe({
        next: (p) => {
          this.form.patchValue(
            {
              id: p.id,
              name: p.name,
              description: p.description,
              logo: p.logo,
              date_release: p.date_release,
              date_revision: p.date_revision,
            },
            { emitEvent: true },
          );
        },
        error: (err) => {
          console.error(err);
          this.loadError.set(
            'Producto no encontrado o error cargando producto',
          );
        },
      });
    }
    this.nameCount.set(this.form.controls.name.value?.length ?? 0);
    this.descCount.set(this.form.controls.description.value?.length ?? 0);

    this.form.controls.name.valueChanges.subscribe((v) => {
      this.nameCount.set((v ?? '').length);
    });

    this.form.controls.description.valueChanges.subscribe((v) => {
      this.descCount.set((v ?? '').length);
    });
  }

  reset() {
    this.submitAttempted.set(false);
    if (this.isEdit()) {
      this.toast.show('Es una edición no puedes reiniciar el formulario');
      return;
    }
    this.toast.show('Formulario reiniciado');
    this.form.reset();
    this.form.controls.date_revision.setValue('');
  }

  submit() {
    this.submitAttempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: Product = {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      logo: raw.logo,
      date_release: raw.date_release,
      date_revision: raw.date_revision,
    };

    const req$ = this.isEdit()
      ? this.api.update(payload.id, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.show(res?.message ?? 'Guardado', 'success');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        this.saving.set(false);
        this.toast.show('No se pudo guardar el producto', 'error');
      },
    });
  }

  showErr(name: keyof ProductFormControls) {
    const c = this.form.controls[name];
    return (c.touched || this.submitAttempted()) && c.invalid;
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}

type ProductFormControls = {
  id: any;
  name: any;
  description: any;
  logo: any;
  date_release: any;
  date_revision: any;
};
