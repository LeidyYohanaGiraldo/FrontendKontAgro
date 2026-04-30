import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenedorPrincipalComponent } from './contenedor-principal.component';

describe('ContenedorPrincipalComponent', () => {
  let component: ContenedorPrincipalComponent;
  let fixture: ComponentFixture<ContenedorPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenedorPrincipalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContenedorPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
