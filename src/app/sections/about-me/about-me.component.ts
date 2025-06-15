import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-me',
  imports: [CommonModule, TranslateModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
})
export class AboutMeComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const line = document.getElementById('sectionLine');
    if (line) {
      const observer = this.createIntersectionObserver(line);
      observer.observe(line);
    }
  }

  private createIntersectionObserver(line: HTMLElement): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => this.handleIntersection(entries, line),
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[], line: HTMLElement): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }
}
