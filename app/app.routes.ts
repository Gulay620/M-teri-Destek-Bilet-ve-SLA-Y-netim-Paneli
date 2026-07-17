import { Routes } from '@angular/router';

// Bileşenleri doğrudan import ediyoruz (TypeScript yolları kesin görsün diye)
import { TicketDashboardComponent } from './features/tickets/pages/ticket-dashboard/ticket-dashboard.component';
import { TicketInboxComponent } from './features/tickets/pages/ticket-inbox/ticket-inbox.component';
import { TicketNewComponent } from './features/tickets/pages/ticket-new/ticket-new.component';
import { TicketDetailComponent } from './features/tickets/pages/ticket-detail/ticket-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: TicketDashboardComponent
  },
  {
    path: 'tickets',
    component: TicketInboxComponent
  },
  {
    path: 'tickets/yeni',
    component: TicketNewComponent
  },
  {
    path: 'tickets/:id',
    component: TicketDetailComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];