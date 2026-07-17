import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { TicketService } from '../../../../core/services/ticket.service';
import { Ticket, TicketStatus, TicketPriority, TicketFilter } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-inbox.component.html'
})
export class TicketInboxComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);

  // State Yönetimi (Signals)
  tickets = signal<Ticket[]>([]);
  isLoading = signal<boolean>(true);
  isError = signal<boolean>(false);

  // Filtre State'leri
  selectedStatus = signal<string>('');
  selectedPriority = signal<string>('');
  searchQuery = signal<string>('');

  // Pagination State'leri
  currentPage = signal<number>(1);
  pageSize = signal<number>(5); // Sayfa başına bilet sayısı

  // Arama Debounce için RxJS Subject
  private searchSubject = new Subject<string>();
  private filterSub!: Subscription;

  // Toplam sayfa sayısını ve mevcut sayfadaki biletleri hesaplayan Computed Signals
  totalFilteredCount = computed(() => this.tickets().length);
  
  totalPages = computed(() => {
    const count = this.totalFilteredCount();
    return count > 0 ? Math.ceil(count / this.pageSize()) : 1;
  });

  paginatedTickets = computed(() => {
    const list = this.tickets();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });

  ngOnInit(): void {
    // İlk yükleme ve filtre değişimlerini dinleyen ana RxJS akışı
    this.loadTickets();

    // Arama girdisi için Debounce Mekanizması (Teknik Şartlar İsteri)
    this.filterSub = this.searchSubject.pipe(
      debounceTime(400), // 400ms bekler, ardışık istekleri engeller
      distinctUntilChanged(),
      tap((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1); // Arama yapılınca 1. sayfaya dön
        this.loadTickets();
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.filterSub) this.filterSub.unsubscribe();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onFilterChange(): void {
    this.currentPage.set(1); // Filtre değişince sayfayı sıfırla
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    this.isError.set(false);

    const filters: TicketFilter = {
      status: this.selectedStatus() ? this.selectedStatus() as TicketStatus : undefined,
      priority: this.selectedPriority() ? this.selectedPriority() as TicketPriority : undefined,
      searchQuery: this.searchQuery() || undefined
    };

    this.ticketService.getTickets(filters).subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  // Sayfa Değiştirme Fonksiyonları
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  // İş Kuralı 5: Listede SLA riski %80'i geçen biletler için yardımcı görsel kontrolör
  checkSlaRisk(ticket: Ticket): boolean {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') return false;
    const creationTime = new Date(ticket.createdAt).getTime();
    const deadlineTime = new Date(ticket.slaDeadline).getTime();
    const totalSla = deadlineTime - creationTime;
    const passed = Date.now() - creationTime;
    return (passed / totalSla) >= 0.8;
  }
}