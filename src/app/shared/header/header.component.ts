import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  currentLang: 'en' | 'de' = 'de';
  hoveredLang: 'en' | 'de' | null = null;

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
    // optional: Sprache global setzen, z. B. via ngx-translate oder i18n
    console.log('Sprache gewechselt zu:', this.currentLang);
  }

  setLanguage(lang: 'en' | 'de') {
    this.currentLang = lang;
    // optional: Sprache global setzen
    console.log('Sprache gewechselt zu:', this.currentLang);
  }
}
