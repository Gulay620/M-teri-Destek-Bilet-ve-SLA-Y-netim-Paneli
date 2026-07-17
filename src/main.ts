import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // 'App' yerine 'AppComponent' yaptık

bootstrapApplication(AppComponent, appConfig) // Burayı da güncelledik
  .catch((err) => console.error(err));