import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const contactLine = document.getElementById('contact-scribble');
    if (contactLine) {
      const observer = this.createIntersectionObserver(contactLine);
      observer.observe(contactLine);
    }
  }

  private createIntersectionObserver(
    contactLine: HTMLElement
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => this.handleIntersection(entries, contactLine),
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );
  }

  private handleIntersection(
    entries: IntersectionObserverEntry[],
    contactLine: HTMLElement
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        contactLine.classList.add('active');
      } else {
        contactLine.classList.remove('active');
      }
    });
  }
}
