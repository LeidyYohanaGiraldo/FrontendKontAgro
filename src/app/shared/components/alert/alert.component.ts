import { Component, OnInit } from '@angular/core';
import { AlertData, AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit {
  mensaje: string = '';
  tipo: 'success' | 'error' | 'warning' = 'success';

  visible = false;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.alert$.subscribe((data: AlertData) => {

      this.mensaje = data.mensaje;
      this.tipo = data.tipo;
      this.visible = true;

      setTimeout(() => {
        this.visible = false;
      }, 5000);

    });
  }
}
