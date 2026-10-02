import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ActividadesComponent } from './features/actividades/actividades.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ContabilidadComponent } from './features/contabilidad/contabilidad.component';
import { EgresosComponent } from './features/egresos/egresos.component';
import { IngresosComponent } from './features/ingresos/ingresos.component';
import { LiquidacionesNominaComponent } from './features/liquidaciones-nomina/liquidaciones-nomina.component';
import { MenuComponent } from './features/menu/menu.component';
import { PagosTrabajadoresComponent } from './features/pagos-trabajadores/pagos-trabajadores.component';
import { TareasRealizadasComponent } from './features/tareas-realizadas/tareas-realizadas.component';
import { TrabajadoresComponent } from './features/trabajadores/trabajadores.component';
import { ContenedorPrincipalComponent } from './shared/components/contenedor-principal/contenedor-principal.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ContenedorPrincipalComponent,
    canActivate: [authGuard],
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'ingresos', component: IngresosComponent },
      { path: 'egresos', component: EgresosComponent },
      { path: 'actividades', component: ActividadesComponent },
      { path: 'trabajadores', component: TrabajadoresComponent },
      { path: 'tareas-realizadas', component: TareasRealizadasComponent },
      { path: 'pagos-trabajadores', component: PagosTrabajadoresComponent },
      { path: 'liquidaciones-nomina', component: LiquidacionesNominaComponent },
      { path: 'contabilidad', component: ContabilidadComponent },
      { path: '', redirectTo: 'menu', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
