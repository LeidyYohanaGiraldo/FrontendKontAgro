import { TestBed } from '@angular/core/testing';

import { IngresosService } from './ingreso.service';

describe('IngresosService', () => {
  let service: IngresosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngresosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
