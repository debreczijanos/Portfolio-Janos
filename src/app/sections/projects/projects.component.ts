import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const line = document.getElementById('projectsLine');
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

  private handleIntersection(
    entries: IntersectionObserverEntry[],
    line: HTMLElement
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }
}
