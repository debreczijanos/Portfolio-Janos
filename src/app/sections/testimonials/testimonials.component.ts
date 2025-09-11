import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-testimonials',
  imports: [CommonModule, TranslateModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const testimonialsLine = document.getElementById('testimonialsLine');
    if (testimonialsLine) {
      const observer = this.createIntersectionObserver(testimonialsLine);
      observer.observe(testimonialsLine);
    }
  }

  private createIntersectionObserver(
    testimonialsLine: HTMLElement
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => this.handleIntersection(entries, testimonialsLine),
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );
  }

  private handleIntersection(
    entries: IntersectionObserverEntry[],
    testimonialsLine: HTMLElement
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        testimonialsLine.classList.add('active');
      } else {
        testimonialsLine.classList.remove('active');
      }
    });
  }
}
