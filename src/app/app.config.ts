import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
 
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers:
    [provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor,errorInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'es-CO' }
      // provideClientHydration()

    ]
};
