import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ContenedorPrincipalComponent } from './shared/components/contenedor-principal/contenedor-principal.component';
import { MenuComponent } from './features/menu/menu.component';
import { IngresosComponent } from './features/ingresos/ingresos.component';
import { EgresosComponent } from './features/egresos/egresos.component';
import { ActividadesComponent } from './features/actividades/actividades.component';

export const routes: Routes = [
 
   { path: 'login', component: LoginComponent },

// Ruta raíz que carga el contenedor y sus hijos
  {
    path: '',
    component: ContenedorPrincipalComponent,
    children: [

      { path: 'menu', component: MenuComponent },
      { path: 'ingresos', component: IngresosComponent },
      { path: 'egresos', component: EgresosComponent },
      { path: 'actividades', component: ActividadesComponent },
      { path: '', redirectTo: 'menu', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }

];

