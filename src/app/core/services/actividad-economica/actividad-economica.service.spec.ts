import { TestBed } from '@angular/core/testing';

import { ActividadEconomicaService } from './actividad-economica.service';

describe('ActividadEconomicaService', () => {
  let service: ActividadEconomicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActividadEconomicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
