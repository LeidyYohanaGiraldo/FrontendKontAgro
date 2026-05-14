import { Component, inject, OnInit } from '@angular/core';
import { IngresoService } from './services/ingreso.service';
import { ActividadService } from '../actividades/services/actividad.service';
import { Ingreso } from './models/ingreso.model';
import { Actividad } from '../actividades/models/actividad.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingresos.component.html',
  styleUrl: './ingresos.component.scss'
})
export class IngresosComponent implements OnInit {
  private _ingresoService = inject(IngresoService);
  private _actividadService = inject(ActividadService);

  public listaIngresos: Ingreso[] = [];
  public listaActividades: Actividad[] = [];

  public ingresoSeleccionado: Ingreso = this.initIngreso();
  public esEdicion = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargamos ingresos
    // this._ingresoService.listarTodos().subscribe(data => this.listaIngresos = data);
    // Cargamos actividades para el select del formulario
    //this._actividadService.listarTodas().subscribe(data => this.listaActividades = data);
    this._ingresoService.listarTodos().subscribe(data => {
      console.log("INGRESOS:", data);
      this.listaIngresos = data;
    });

    this._actividadService.listarTodas().subscribe(data => {
      console.log("ACTIVIDADES:", data);
      this.listaActividades = data;
    });

  }

  initIngreso(): Ingreso {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      valor: 0,
      idActividad: 0
    };
  }

  // El método guardar enviará el objeto tal cual lo espera el @RequestBody IngresoDTO
  guardar() {
    if (this.esEdicion) {
      this._ingresoService.actualizar(this.ingresoSeleccionado).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    } else {
      this._ingresoService.crear(this.ingresoSeleccionado).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    }
  }

  prepararEdicion(ingreso: Ingreso) {
    this.ingresoSeleccionado = { ...ingreso };
    this.esEdicion = true;
  }

  limpiarFormulario() {
    this.ingresoSeleccionado = this.initIngreso();
    this.esEdicion = false;
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este registro de ingreso?')) {
      this._ingresoService.eliminar(id).subscribe(() => this.cargarDatos());
    }
  }
  obtenerNombreActividad(idActividad: number): string {
  const actividad = this.listaActividades.find(
    a => a.idActividad == idActividad
  );
  return actividad ? actividad.nombreActividad : '';
}
}
