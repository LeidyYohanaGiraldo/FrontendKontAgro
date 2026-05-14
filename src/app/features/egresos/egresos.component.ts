import { Component, inject, OnInit } from '@angular/core';
import { EgresoService } from './services/egreso.service';
import { ActividadService } from '../actividades/services/actividad.service';
import { Egreso } from './models/egreso.model';
import { Actividad } from '../actividades/models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-egresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './egresos.component.html',
  styleUrl: './egresos.component.scss'
})
export class EgresosComponent implements OnInit {
  private _egresoService = inject(EgresoService);
  private _actividadService = inject(ActividadService);

  public listaEgresos: Egreso[] = [];
  public listaActividades: Actividad[] = [];

  public egresoSeleccionado: Egreso = this.initIngreso();
  public esEdicion = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargamos egresos
    
    this._egresoService.listarTodos().subscribe(data => {
      console.log("EGRESOS:", data);
      this.listaEgresos = data;
    });

    this._actividadService.listarTodas().subscribe(data => {
      console.log("ACTIVIDADES:", data);
      this.listaActividades = data;
    });

  }

  initIngreso(): Egreso {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      valor: 0,
      idActividad: 0
    };
  }

  // El método guardar enviará el objeto tal cual lo espera el @RequestBody IngresoDTO
  guardar() {
    if (this.esEdicion) {
      this._egresoService.actualizar(this.egresoSeleccionado).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    } else {
      this._egresoService.crear(this.egresoSeleccionado).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    }
  }

  prepararEdicion(egreso: Egreso) {
    this.egresoSeleccionado = { ...egreso };
    this.esEdicion = true;
  }

  limpiarFormulario() {
    this.egresoSeleccionado = this.initIngreso();
    this.esEdicion = false;
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este registro de egreso?')) {
      this._egresoService.eliminar(id).subscribe(() => this.cargarDatos());
    }
  }
  obtenerNombreActividad(idActividad: number): string {
    const actividad = this.listaActividades.find(
      a => a.idActividad == idActividad
    );
    return actividad ? actividad.nombreActividad : '';
  }
}
