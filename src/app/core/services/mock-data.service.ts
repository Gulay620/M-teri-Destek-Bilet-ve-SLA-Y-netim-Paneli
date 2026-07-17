import { Injectable } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  private tickets: Ticket[] = [
    {
      id: 'TK-101',
      title: 'Ödeme Entegrasyonu Zaman Aşımı Hatası',
      description: 'Müşteriler sepet aşamasında kredi kartıyla ödeme yaparken 504 Gateway Timeout hatası alıyor.',
      priority: 'CRITICAL',
      status: 'NEW',
      category: 'PAYMENT',
      customer: {
        id: 'C-1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@sirket.com',
        company: 'Tekno Holding'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      comments: [],
      auditLog: [],
      history: [
        {
          id: 'H-101',
          timestamp: new Date().toISOString(),
          action: 'Bilet oluşturuldu',
          user: 'Sistem',
          role: 'CUSTOMER'
        }
      ]
    },
    {
      id: 'TK-102',
      title: 'Fatura PDF Çıktısı Karakter Sorunu',
      description: 'Türkçe karakterler fatura indirildiğinde soru işareti olarak görünüyor.',
      priority: 'HIGH',
      status: 'ASSIGNED',
      category: 'BILLING',
      customer: {
        id: 'C-2',
        name: 'Ayşe Kaya',
        email: 'ayse@e-ticaret.com',
        company: 'E-Ticaret Ltd.'
      },
      assignee: {
        id: 'A-1',
        name: 'Mehmet Demir',
        email: 'mehmet@destek.com',
        role: 'SUPPORT_AGENT'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      comments: [
        {
          id: 'CM-101',
          ticketId: 'TK-102',
          body: 'Sorun font ailesinden kaynaklanıyor olabilir, inceliyorum.',
          user: 'Mehmet Demir',
          author: 'Mehmet Demir',
          role: 'SUPPORT_AGENT',
          authorRole: 'SUPPORT_AGENT',
          createdAt: new Date().toISOString()
        }
      ],
      auditLog: [],
      history: [
        {
          id: 'H-102',
          timestamp: new Date().toISOString(),
          action: 'Bilet Mehmet Demir kullanıcısına atandı',
          user: 'Selin Yurt',
          role: 'TEAM_LEADER'
        }
      ]
    }
  ];

  getTickets(): Ticket[] {
    return this.tickets;
  }
}