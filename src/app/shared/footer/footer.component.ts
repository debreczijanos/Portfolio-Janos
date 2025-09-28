import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input() theme: 'light' | 'dark' = 'light';

  @HostBinding('class.footer--dark')
  get isDark(): boolean {
    return this.theme === 'dark';
  }

  @HostBinding('class.footer--light')
  get isLight(): boolean {
    return this.theme !== 'dark';
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
