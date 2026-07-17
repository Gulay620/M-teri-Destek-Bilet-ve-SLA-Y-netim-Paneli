import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';
import { Ticket } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-dashboard.component.html'
})
export class TicketDashboardComponent implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);
  isLoading = signal<boolean>(true);

  // Döküman Kriteri: KPI Kartları & Durum Dağılımı (Computed)
  totalTickets = computed(() => this.tickets().length);
  
  statusCounts = computed(() => {
    const list = this.tickets();
    return {
      new: list.filter(t => t.status === 'NEW').length,
      inProgress: list.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: list.filter(t => t.status === 'RESOLVED').length,
      closed: list.filter(t => t.status === 'CLOSED').length
    };
  });

  priorityCounts = computed(() => {
    const list = this.tickets();
    return {
      critical: list.filter(t => t.priority === 'CRITICAL').length,
      high: list.filter(t => t.priority === 'HIGH').length,
      medium: list.filter(t => t.priority === 'MEDIUM').length,
      low: list.filter(t => t.priority === 'LOW').length
    };
  });

  // İş Kuralı 5: SLA Riski %80 Eşiğini Geçen Kritik Biletler
  slaAtRiskTickets = computed(() => {
    const now = Date.now();
    return this.tickets().filter(t => {
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') return false;
      
      const creationTime = new Date(t.createdAt).getTime();
      const deadlineTime = new Date(t.slaDeadline).getTime();
      const totalSlaDuration = deadlineTime - creationTime;
      const timePassed = now - creationTime;
      
      // Geçen süre toplam SLA süresinin %80'ine ulaştı mı veya geçti mi?
      const riskRatio = timePassed / totalSlaDuration;
      return riskRatio >= 0.8;
    });
  });

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Veri yüklenirken hata:', err);
        this.isLoading.set(false);
      }
    });
  }
}