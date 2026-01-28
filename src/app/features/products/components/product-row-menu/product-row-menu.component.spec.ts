import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRowMenuComponent } from './product-row-menu.component';

describe('ProductRowMenuComponent', () => {
  let component: ProductRowMenuComponent;
  let fixture: ComponentFixture<ProductRowMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRowMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRowMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
