import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';
import { AuditLogEntry } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
  private ticketService = inject(TicketService);

  auditLogs = signal<AuditLogEntry[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.ticketService.getAuditLogs().subscribe({
      next: (data) => {
        // En yeni logları en üstte göstermek için tarih sıralaması
        this.auditLogs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Loglar yüklenirken hata oluştu:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Arayüzde badge renklerini dinamik basmak için yardımcı metot
  getActionColor(actionType: string): string {
    switch (actionType) {
      case 'TICKET_CREATE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STATUS_CHANGE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMMENT_ADD': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INTERNAL_NOTE_ADD': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }
}