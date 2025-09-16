import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [TranslateModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  currentLang: 'en' | 'de' = 'de';
  hoveredLang: 'en' | 'de' | null = null;
  solidHeader = false;
  isProjectRoute = false;
  menuOpen = false;

  constructor(private translate: TranslateService, private router: Router) {
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);

    // Set initial header style based on current URL
    this.solidHeader = !this.isTransparentRoute(this.router.url);
    this.isProjectRoute = this.router.url.startsWith('/projects/');

    // Update on navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.solidHeader = !this.isTransparentRoute(this.router.url);
        this.isProjectRoute = this.router.url.startsWith('/projects/');
      });
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
    this.translate.use(this.currentLang);
  }

  setLanguage(lang: 'en' | 'de') {
    this.currentLang = lang;
    this.translate.use(this.currentLang);
  }

  private isTransparentRoute(url: string): boolean {
    // Keep header transparent on home, legal notice, and project detail pages
    return (
      url === '/' ||
      url.startsWith('/legal-notice') ||
      url.startsWith('/projects/')
    );
  }

  goTo(sectionId: 'about' | 'skills' | 'projects' | 'contact', event?: Event) {
    if (event) event.preventDefault();
    const scroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (this.router.url === '/') {
      scroll();
    } else {
      this.router.navigateByUrl('/').then(() => setTimeout(scroll));
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  onMobileNav(event: Event, sectionId: 'about' | 'skills' | 'projects' | 'contact') {
    event.preventDefault();
    const anchor = event.currentTarget as HTMLElement | null;
    if (anchor) {
      anchor.classList.add('pressed');
    }
    // allow the pressed animation to show before navigating/closing
    setTimeout(() => {
      this.goTo(sectionId);
      this.closeMenu();
      if (anchor) anchor.classList.remove('pressed');
    }, 220);
  }

  onMobileLangTap(lang: 'en' | 'de', event?: Event) {
    if (event) event.preventDefault();
    // Briefly show the hover frame on mobile before switching
    this.hoveredLang = lang;
    setTimeout(() => {
      this.setLanguage(lang);
      this.hoveredLang = null;
    }, 180);
  }
}
