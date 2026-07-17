import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../core/services/ticket.service';
import { Ticket, TicketComment, InternalNote, TicketStatus, UserRole } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-detail.component.html'})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  // State Yönetimi
  ticket = signal<Ticket | undefined>(undefined);
  comments = signal<TicketComment[]>([]);
  internalNotes = signal<InternalNote[]>([]);
  isLoading = signal<boolean>(true);
  
  // Form State'leri
  newCommentText = signal<string>('');
  newNoteText = signal<string>('');
  solutionSummaryText = signal<string>('');
  reopenReasonText = signal<string>('');
  
  // Sekme ve Hata Yönetimi
  activeTab = signal<'comments' | 'notes' | 'history'>('comments');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Simüle Edilen Giriş Yapmış Kullanıcı Bilgisi (Döküman Rol İsteri İçin)
  currentUser = 'Ahmet Yılmaz';
  currentUserRole: UserRole = 'SUPPORT_AGENT'; // Arayüz yetkilendirmesi için

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicketData(id);
    }
  }

  loadTicketData(id: string): void {
    this.isLoading.set(true);
    this.ticketService.getTicketById(id).subscribe((t) => {
      this.ticket.set(t);
      if (t) {
        // Yorumları ve İç Notları paralel olarak çek
        this.ticketService.getComments(t.id).subscribe(c => this.comments.set(c));
        this.ticketService.getInternalNotes(t.id).subscribe(n => this.internalNotes.set(n));
      }
      this.isLoading.set(false);
    });
  }

  // Dışa Açık Müşteri Yorumu Ekleme
  postComment(): void {
    const currentTicket = this.ticket();
    if (!currentTicket || !this.newCommentText().trim()) return;

    this.ticketService.addComment(
      currentTicket.id, 
      this.newCommentText(), 
      this.currentUser, 
      this.currentUserRole
    ).subscribe((newComment) => {
      this.comments.update(old => [...old, newComment]);
      this.newCommentText.set('');
      this.loadTicketData(currentTicket.id); // Geçmiş logu tazelemek için
    });
  }

  // İş Kuralı 4: Müşteriye Gizli İç Not Ekleme
  postInternalNote(): void {
    const currentTicket = this.ticket();
    if (!currentTicket || !this.newNoteText().trim()) return;

    this.ticketService.addInternalNote(
      currentTicket.id, 
      this.newNoteText(), 
      this.currentUser
    ).subscribe((newNote) => {
      this.internalNotes.update(old => [...old, newNote]);
      this.newNoteText.set('');
      this.loadTicketData(currentTicket.id);
    });
  }

  // İş Kuralı 2 & 6 Kapsamında Durum Güncelleme Validasyonu
  changeStatus(newStatus: TicketStatus): void {
    const currentTicket = this.ticket();
    if (!currentTicket) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    // İş Kuralı 6 Validasyonu
    if (newStatus === 'RESOLVED' && !this.solutionSummaryText().trim()) {
      this.errorMessage.set('Hata: Bilet çözülmeden önce "Çözüm Özeti" girilmesi zorunludur!');
      return;
    }

    // İş Kuralı 2 Validasyonu
    if (currentTicket.status === 'CLOSED' && newStatus !== 'CLOSED' && !this.reopenReasonText().trim()) {
      this.errorMessage.set('Hata: Kapalı bir bileti yeniden açmak için "Yeniden Açma Gerekçesi" belirtmelisiniz!');
      return;
    }

    this.ticketService.updateTicketStatus(
      currentTicket.id, 
      newStatus, 
      this.currentUser, 
      this.currentUserRole,
      {
        solutionSummary: this.solutionSummaryText() || undefined,
        reopenReason: this.reopenReasonText() || undefined
      }
    ).subscribe({
      next: () => {
        this.successMessage.set(`Bilet durumu başarıyla "${newStatus}" yapıldı.`);
        this.solutionSummaryText.set('');
        this.reopenReasonText.set('');
        this.loadTicketData(currentTicket.id);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      }
    });
  }
}