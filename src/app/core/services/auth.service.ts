import { Injectable, signal, computed } from '@angular/core';
import { UserRole } from '../models/ticket.model';

export interface AuthUser {
  name: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Uygulama ilk açıldığında varsayılan olarak SUPPORT_AGENT rolü ile başlar
  private currentUserSignal = signal<AuthUser>({
    name: 'Ahmet Yılmaz (Destek Ajanı)',
    role: 'SUPPORT_AGENT'
  });

  // Dışarıdan salt okunur (read-only) erişim için sinyal
  currentUser = computed(() => this.currentUserSignal());

  constructor() {}

  /**
   * app.component.ts dosyasında çağrılan ve aktif kullanıcının adını dönen fonksiyon
   */
  currentUserName(): string {
    return this.currentUserSignal().name;
  }

  /**
   * Aktif kullanıcının rolünü dönen yardımcı fonksiyon
   */
  currentUserRole(): UserRole {
    return this.currentUserSignal().role;
  }

  /**
   * Arayüzdeki rol değiştirme menüsünden tetiklenen rol anahtarlama fonksiyonu
   * @param role Yeni atanacak kurumsal rol
   * @param name Kullanıcının ekranda görünecek ismi
   */
  switchRole(role: UserRole, name: string): void {
    this.currentUserSignal.set({ name, role });
  }

  /**
   * Belirli bir role ait yetki kontrolü yapan fonksiyon
   */
  hasRole(allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(this.currentUserSignal().role);
  }
}