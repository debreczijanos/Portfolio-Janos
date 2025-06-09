import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  currentLang: 'en' | 'de' = 'de';
  hoveredLang: 'en' | 'de' | null = null;

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
    this.translate.use(this.currentLang);
  }

  setLanguage(lang: 'en' | 'de') {
    this.currentLang = lang;
    this.translate.use(this.currentLang);
  }
}
