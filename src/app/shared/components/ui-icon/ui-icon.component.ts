import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type UiIconName =
  | 'menu'
  | 'home'
  | 'income'
  | 'expense'
  | 'activities'
  | 'workers'
  | 'tasks'
  | 'payments'
  | 'payroll'
  | 'logout'
  | 'edit'
  | 'delete'
  | 'cancel'
  | 'view'
  | 'activate'
  | 'accounting'
  | 'report'
  | 'attachment'
  | 'download';

@Component({
  selector: 'app-ui-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      [attr.data-icon]="name">
      <ng-container [ngSwitch]="name">
        <g *ngSwitchCase="'menu'">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </g>

        <g *ngSwitchCase="'home'">
          <path d="M3.5 10.8 12 3.8l8.5 7v8.4a1 1 0 0 1-1 1h-5.1v-6.1H9.6v6.1H4.5a1 1 0 0 1-1-1Z" />
        </g>

        <g *ngSwitchCase="'income'">
          <circle cx="9" cy="13" r="5.2" />
          <path d="M9 10.2v5.6M7.4 11.2h2.2a1.2 1.2 0 0 1 0 2.4H8.4a1.2 1.2 0 0 0 0 2.4h2.2" />
          <path d="M15.2 4.3h5v5M20.1 4.4l-5.7 5.7" />
        </g>

        <g *ngSwitchCase="'expense'">
          <circle cx="9" cy="11" r="5.2" />
          <path d="M9 8.2v5.6M7.4 9.2h2.2a1.2 1.2 0 0 1 0 2.4H8.4a1.2 1.2 0 0 0 0 2.4h2.2" />
          <path d="M15.1 19.6h5v-5M20.1 19.5l-5.7-5.7" />
        </g>

        <g *ngSwitchCase="'activities'">
          <rect x="3.3" y="5.2" width="17.4" height="15" rx="2" />
          <path d="M7 3.5v3.4M17 3.5v3.4M3.3 9.2h17.4" />
          <path d="m8 14 2.1 2.1 4.7-4.7" />
        </g>

        <g *ngSwitchCase="'workers'">
          <circle cx="9" cy="8" r="3.1" />
          <path d="M3.7 19.8v-1.6A5.3 5.3 0 0 1 9 12.9a5.3 5.3 0 0 1 5.3 5.3v1.6" />
          <circle cx="17.3" cy="9.3" r="2.2" />
          <path d="M15.2 14.1a4.3 4.3 0 0 1 5.1 4.2v1.5" />
        </g>

        <g *ngSwitchCase="'tasks'">
          <rect x="5" y="4.7" width="14" height="16" rx="2" />
          <path d="M9 4.7V3.4h6v1.3M8.2 9.3h7.6" />
          <path d="m8.2 14 2.1 2.1 4.5-4.5" />
        </g>

        <g *ngSwitchCase="'payments'">
          <rect x="3.2" y="6.2" width="17.6" height="12.2" rx="2" />
          <path d="M3.2 10h17.6M6.4 14.5h4.3" />
          <circle cx="17.2" cy="14.4" r="1.5" />
        </g>

        <g *ngSwitchCase="'payroll'">
          <path d="M6 3.5h9l3 3v14H6z" />
          <path d="M15 3.5v3h3M9 10h6M9 13h3" />
          <path d="m10 17 1.5 1.5 3.3-3.3" />
        </g>

        <g *ngSwitchCase="'logout'">
          <path d="M10 4H5.5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5.5 20H10" />
          <path d="M14.5 7.5 19 12l-4.5 4.5M19 12H9" />
        </g>

        <g *ngSwitchCase="'edit'">
          <path d="m4.5 19.5 3.7-.8 10-10a1.8 1.8 0 0 0-2.6-2.6l-10 10z" />
          <path d="m14.5 7.2 2.6 2.6" />
        </g>

        <g *ngSwitchCase="'delete'">
          <path d="M5.5 7h13M9 7V4.5h6V7M7.2 7l.8 13h8l.8-13M10 10.5v6M14 10.5v6" />
        </g>

        <g *ngSwitchCase="'cancel'">
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.8 8.8 6.4 6.4M15.2 8.8l-6.4 6.4" />
        </g>

        <g *ngSwitchCase="'view'">
          <path d="M2.8 12s3.2-5.2 9.2-5.2 9.2 5.2 9.2 5.2-3.2 5.2-9.2 5.2S2.8 12 2.8 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </g>

        <g *ngSwitchCase="'activate'">
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.2 12.2 2.5 2.5 5.2-5.2" />
        </g>

        <g *ngSwitchCase="'accounting'">
          <path d="M4 20V10M10 20V5M16 20v-7M22 20H2" />
          <path d="m4 7 5-3 6 4 5-4" />
        </g>

        <g *ngSwitchCase="'report'">
          <path d="M6 3.5h9l3 3v14H6z" />
          <path d="M15 3.5v3h3M9 10h6M9 13h6M9 16h4" />
        </g>

        <g *ngSwitchCase="'attachment'">
          <path d="m8.2 12.5 6.7-6.7a3 3 0 0 1 4.2 4.2l-8.2 8.2a4.5 4.5 0 0 1-6.4-6.4l8-8" />
        </g>

        <g *ngSwitchCase="'download'">
          <path d="M12 3.5v11M8 10.5l4 4 4-4M5 19.5h14" />
        </g>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      flex: 0 0 auto;
    }

    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `]
})
export class UiIconComponent {
  @Input({ required: true }) name!: UiIconName;
}
