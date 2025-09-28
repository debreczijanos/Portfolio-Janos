import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

type SectionId = 'hero' | 'about' | 'skills' | 'projects' | 'contact';

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
  private readonly storageKey = 'portfolio.preferredLang';

  constructor(private translate: TranslateService, private router: Router) {
    const stored = this.getStoredLang();
    if (stored) {
      this.currentLang = stored;
    }

    this.translate.setDefaultLang('de');
    this.translate.use(this.currentLang);
    this.solidHeader = !this.isTransparentRoute(this.router.url);
    this.isProjectRoute = this.router.url.startsWith('/projects/');
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.solidHeader = !this.isTransparentRoute(this.router.url);
        this.isProjectRoute = this.router.url.startsWith('/projects/');
      });
  }

  toggleLanguage() {
    const next = this.currentLang === 'en' ? 'de' : 'en';
    this.setLanguage(next);
  }

  setLanguage(lang: 'en' | 'de') {
    this.currentLang = lang;
    this.translate.use(this.currentLang);
    this.persistLang(lang);
  }

  private isTransparentRoute(url: string): boolean {
    return (
      url === '/' ||
      url.startsWith('/legal-notice') ||
      url.startsWith('/projects/')
    );
  }

  goTo(sectionId: SectionId, event?: Event) {
    if (event) event.preventDefault();
    const scroll = () => {
      if (typeof window === 'undefined') return;

      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const el = document.getElementById(sectionId);
      if (!el) return;

      const header = document.querySelector('header');
      const headerOffset = header?.getBoundingClientRect().height ?? 0;
      const targetTop =
        el.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
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

  onMobileNav(event: Event, sectionId: SectionId) {
    event.preventDefault();
    const anchor = event.currentTarget as HTMLElement | null;
    if (anchor) {
      anchor.classList.add('pressed');
    }
    setTimeout(() => {
      this.goTo(sectionId);
      this.closeMenu();
      if (anchor) anchor.classList.remove('pressed');
    }, 220);
  }

  onMobileLangTap(lang: 'en' | 'de', event?: Event) {
    if (event) event.preventDefault();
    this.hoveredLang = lang;
    setTimeout(() => {
      this.setLanguage(lang);
      this.hoveredLang = null;
    }, 180);
  }

  private getStoredLang(): 'en' | 'de' | null {
    if (typeof window === 'undefined') return null;
    try {
      const lang = window.localStorage.getItem(this.storageKey);
      return lang === 'en' || lang === 'de' ? lang : null;
    } catch {
      return null;
    }
  }

  private persistLang(lang: 'en' | 'de') {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.storageKey, lang);
    } catch {}
  }
}
