import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './core/models/ticket.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- Üst Navigasyon ve Rol Seçim Çubuğu -->
      <header class="app-header">
        <div class="brand" routerLink="/dashboard">
          <h2>Kurumsal Destek Sistemi</h2>
        </div>
        
        <nav class="main-nav">
          <a routerLink="/dashboard" routerLinkActive="active">Rapor Paneli</a>
          <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Tüm Biletler</a>
          <a routerLink="/tickets/yeni" routerLinkActive="active">Yeni Bilet Oluştur</a>
        </nav>

        <div class="auth-status">
          <span class="user-info">Aktif Kullanıcı: <strong>{{ authService.currentUserName() }}</strong></span>
          
          <!-- Hızlı Rol Değiştirici Menü (Simülasyon İçin) -->
          <div class="role-switcher">
            <label for="role-select">Rolü Değiştir:</label>
            <select 
              id="role-select" 
              [value]="authService.currentUserRole()" 
              (change)="onRoleChange($event)">
              <option value="SUPPORT_AGENT">Destek Ajanı (Ahmet)</option>
              <option value="TEAM_LEADER">Takım Lideri (Selin)</option>
              <option value="ADMIN">Sistem Yöneticisi (Murat)</option>
              <option value="CUSTOMER">Müşteri (Can)</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Sayfa İçeriklerinin Yükleneceği Alan -->
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; min-height: 100vh; }
    .app-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: #1e293b; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .brand h2 { margin: 0; cursor: pointer; color: #38bdf8; }
    .main-nav a { color: #94a3b8; text-decoration: none; margin-right: 1.5rem; font-weight: 500; transition: color 0.2s; }
    .main-nav a:hover, .main-nav a.active { color: white; }
    .auth-status { display: flex; align-items: center; gap: 1.5rem; }
    .user-info { font-size: 0.9rem; color: #cbd5e1; }
    .role-switcher { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .role-switcher select { padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #475569; background-color: #334155; color: white; cursor: pointer; }
    .app-content { flex: 1; padding: 2rem; background-color: #f8fafc; }
  `]
})
export class AppComponent {
  // Bağımlılık enjeksiyonunu modern Angular standartlarına uygun yapıyoruz
  public authService = inject(AuthService);

  /**
   * Seçim kutusundan rol değiştirildiğinde çalışan güvenli metot
   */
  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedRole = selectElement.value as UserRole;
    
    let profileName = 'Sistem Kullanıcısı';

    // TS2367 eşleşme hatasını engellemek için kuralları temiz bir şekilde ayırıyoruz
    if (selectedRole === 'SUPPORT_AGENT') {
      profileName = 'Ahmet Yılmaz (Destek Ajanı)';
    } else if (selectedRole === 'TEAM_LEADER') {
      profileName = 'Selin Yurt (Takım Lideri)';
    } else if (selectedRole === 'ADMIN') {
      profileName = 'Murat Demir (Admin)';
    } else if (selectedRole === 'CUSTOMER') {
      profileName = 'Can Baş (Kurumsal Müşteri)';
    }

    // AuthService içindeki metodu tetikliyoruz
    this.authService.switchRole(selectedRole, profileName);
  }
}
