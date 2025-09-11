import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-skills',
  imports: [CommonModule, TranslateModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const line = document.getElementById('skillsLine');
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
