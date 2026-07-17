import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';

// TypeScript'in global Jasmine fonksiyonlarını ve done nesnesini tanıması için tipleri zorluyoruz
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const afterAll: any;

describe('TicketService - Kurumsal İş Kuralları Test Suiti', () => {
  let service: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketService]
    });
    service = TestBed.inject(TicketService);
    localStorage.clear();
  });

  afterAll(() => {
    localStorage.clear();
  });

  it('CRITICAL öncelikli bilet oluşturulduğunda SLA teslim süresi 4 saat sonrasına atanmalıdır', (done: any) => {
    service.createTicket({
      title: 'Kritik Sistem Kesintisi',
      description: 'Üretim sunucularına erişilemiyor.',
      priority: 'CRITICAL',
      customer: { name: 'Can Baş', email: 'can@sirket.com', company: 'X Corp' }
    }).subscribe({
      next: (ticket: any) => {
        expect(ticket.id).toBeDefined();
        expect(ticket.status).toBe('NEW');
        
        const createdAtTime = new Date(ticket.createdAt).getTime();
        const slaDeadlineTime = new Date(ticket.slaDeadline).getTime();
        const diffInHours = (slaDeadlineTime - createdAtTime) / (1000 * 60 * 60);
        
        expect(Math.round(diffInHours)).toBe(4);
        done();
      }
    });
  });

  it('Çözüm özeti sağlanmadan bilet RESOLVED durumuna çekilmek istendiğinde hata fırlatmalıdır', (done: any) => {
    service.createTicket({
      title: 'E-Posta Sorunu',
      priority: 'LOW'
    }).subscribe((createdTicket: any) => {
      service.updateTicketStatus(
        createdTicket.id, 
        'RESOLVED', 
        'Test Ajanı', 
        'SUPPORT_AGENT', 
        { solutionSummary: '' }
      ).subscribe({
        next: () => {
          done.fail('Boş çözüm özetine rağmen durum güncellendi, test başarısız!');
        },
        error: (err: any) => {
          expect(err.message).toContain('Bilet çözülmeden önce çözüm özeti girilmesi zorunludur');
          done();
        }
      });
    });
  });
});