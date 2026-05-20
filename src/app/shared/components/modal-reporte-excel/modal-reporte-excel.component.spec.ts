import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReporteExcelComponent } from './modal-reporte-excel.component';

describe('ModalReporteExcelComponent', () => {
  let component: ModalReporteExcelComponent;
  let fixture: ComponentFixture<ModalReporteExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalReporteExcelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReporteExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
