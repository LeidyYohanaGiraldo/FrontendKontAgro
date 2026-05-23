import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface AlertData {
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertSubject = new Subject<AlertData>();

  public alert$ = this.alertSubject.asObservable();

  success(mensaje: string) {
    this.alertSubject.next({
      tipo: 'success',
      mensaje
    });
  }

  error(mensaje: string) {
    this.alertSubject.next({
      tipo: 'error',
      mensaje
    });
  }

  warning(mensaje: string) {
    this.alertSubject.next({
      tipo: 'warning',
      mensaje
    });
  }
}