import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-project-pollo',
  imports: [CommonModule, RouterModule, TranslateModule, FooterComponent],
  templateUrl: './project-pollo.component.html',
  styleUrls: ['./project-pollo.component.scss'],
})
export class ProjectPolloComponent implements AfterViewInit {
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
