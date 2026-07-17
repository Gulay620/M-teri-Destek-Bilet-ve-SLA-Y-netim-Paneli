import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Ticket, TicketComment, InternalNote, AuditLogEntry, UserRole, TicketStatus } from '../models/ticket.model';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private mockDataService = inject(MockDataService);
  private authService = inject(AuthService);

  private ticketsSignal = signal<Ticket[]>(this.mockDataService.getTickets());

  getTicketsList() {
    return this.ticketsSignal;
  }

  // Inbox sayfasının filtre parametreli çağrısını destekliyoruz
  getTickets(filters?: any): Observable<Ticket[]> {
    let result = this.ticketsSignal();
    if (filters) {
      if (filters.status) result = result.filter(t => t.status === filters.status);
      if (filters.priority) result = result.filter(t => t.priority === filters.priority);
    }
    return of(result);
  }

  getTicketById(id: string): Observable<Ticket | undefined> {
    const ticket = this.ticketsSignal().find(t => t.id === id);
    return of(ticket);
  }

  // Audit Log sayfasının aradığı metot
  getAuditLogs(): Observable<AuditLogEntry[]> {
    const allLogs: AuditLogEntry[] = [];
    this.ticketsSignal().forEach(t => {
      if (t.auditLog) allLogs.push(...t.auditLog);
    });
    return of(allLogs);
  }

  // Detay sayfasının aradığı yorumları getirme metodu
  getComments(ticketId: string): Observable<TicketComment[]> {
    const ticket = this.ticketsSignal().find(t => t.id === ticketId);
    return of(ticket ? ticket.comments : []);
  }

  // Detay sayfasının aradığı dahili notları getirme metodu
  getInternalNotes(ticketId: string): Observable<InternalNote[]> {
    const ticket = this.ticketsSignal().find(t => t.id === ticketId);
    return of(ticket && ticket.internalNotes ? ticket.internalNotes : []);
  }

  createTicket(ticketData: any): Observable<Ticket> {
    const currentTickets = this.ticketsSignal();
    const newId = `TK-${100 + currentTickets.length + 1}`;
    
    const newTicket: Ticket = {
      id: newId,
      title: ticketData.title,
      description: ticketData.description || '',
      priority: ticketData.priority || 'LOW',
      status: 'NEW',
      category: ticketData.category || 'GENERAL',
      customer: {
        id: `C-${Math.floor(Math.random() * 1000)}`,
        name: ticketData.customer?.name || this.authService.currentUserName(),
        email: ticketData.customer?.email || 'email@sirket.com',
        company: ticketData.customer?.company || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      comments: [],
      internalNotes: [],
      auditLog: [],
      history: []
    };

    this.ticketsSignal.set([...currentTickets, newTicket]);
    return of(newTicket);
  }

  // Detay sayfasının 4 parametreyle çağırdığı durum güncelleme metodu
  updateTicketStatus(id: string, status: TicketStatus, ...args: any[]): Observable<Ticket> {
  const currentTickets = this.ticketsSignal();
  const ticketIndex = currentTickets.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return throwError(() => new Error('Bilet bulunamadı.'));
  }

  const updatedTickets = [...currentTickets];
  const targetTicket = { ...updatedTickets[ticketIndex] };

  targetTicket.status = status;
  targetTicket.updatedAt = new Date().toISOString();

  // Eğer sayfa bir opsiyon objesi (örneğin çözüm özeti) gönderdiyse onu da alalım
  const options = args.find(arg => arg && typeof arg === 'object');
  if (options && options.solutionSummary) {
    targetTicket.solutionSummary = options.solutionSummary;
  }

  updatedTickets[ticketIndex] = targetTicket;
  this.ticketsSignal.set(updatedTickets);
  return of(targetTicket);
  }

  addComment(ticketId: string, commentBody: string, ...args: any[]): Observable<TicketComment> {
  const currentTickets = this.ticketsSignal();
  const ticketIndex = currentTickets.findIndex(t => t.id === ticketId);

  if (ticketIndex === -1) {
    return throwError(() => new Error('Bilet bulunamadı.'));
  }

  const newComment: TicketComment = {
    id: `CM-${Math.floor(Math.random() * 1000)}`,
    ticketId: ticketId,
    body: commentBody,
    user: this.authService.currentUserName(),
    author: this.authService.currentUserName(),
    role: this.authService.currentUserRole(),
    authorRole: this.authService.currentUserRole(),
    createdAt: new Date().toISOString()
  };

  const updatedTickets = [...currentTickets];
  const targetTicket = { ...updatedTickets[ticketIndex] }; 

  targetTicket.comments = [...targetTicket.comments, newComment];
  updatedTickets[ticketIndex] = targetTicket;

  this.ticketsSignal.set(updatedTickets);
  return of(newComment);
  }

  // Detay sayfasının aradığı dahili not ekleme metodu
  addInternalNote(ticketId: string, noteBody: string, ...args: any[]): Observable<InternalNote> {
    const currentTickets = this.ticketsSignal();
    const ticketIndex = currentTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex === -1) {
      return throwError(() => new Error('Bilet bulunamadı.'));
    }

    const newNote: InternalNote = {
      id: `IN-${Math.floor(Math.random() * 1000)}`,
      ticketId: ticketId,
      body: noteBody,
      author: this.authService.currentUserName(),
      createdAt: new Date().toISOString()
    };

    const updatedTickets = [...currentTickets];
    const targetTicket = { ...updatedTickets[ticketIndex] };
    if (!targetTicket.internalNotes) targetTicket.internalNotes = [];
    
    targetTicket.internalNotes = [...targetTicket.internalNotes, newNote];
    updatedTickets[ticketIndex] = targetTicket;
    this.ticketsSignal.set(updatedTickets);
    return of(newNote);
  }
}