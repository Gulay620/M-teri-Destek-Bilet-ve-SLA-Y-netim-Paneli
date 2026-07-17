import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './ticket-new.component.html'
})
export class TicketNewComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  // Loading ve Error durumları için Signal yapısı (Döküman gereksinimi)
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form Modeli Tanımlaması
  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    priority: ['MEDIUM', [Validators.required]],
    category: ['', [Validators.required]]
  });

  // Form validasyon kontrollerini HTML'de kolay okumak için yardımcı getter'lar
  get f() { return this.ticketForm.controls; }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched(); // Hatalı alanları kızart
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Müşteri bilgisini şimdilik simüle ediyoruz (Döküman rol mantığı için)
    const mockCustomer = {
      id: 'C-1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@sirket.com',
      company: 'Yılmaz Teknoloji'
    };

    const newTicketData = {
      title: this.ticketForm.value.title,
      description: this.ticketForm.value.description,
      priority: this.ticketForm.value.priority,
      category: this.ticketForm.value.category,
      status: 'NEW' as const,
      customer: mockCustomer
    };

    // Servis üzerinden LocalStorage'a kaydetme ve asenkron simülasyon
    this.ticketService.createTicket(newTicketData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']); // Başarılıysa listeye dön
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Bilet oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.');
      }
    });
  }
}