import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-legal-notice',
  imports: [CommonModule, RouterModule, FooterComponent, TranslateModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  lastUpdated: string = new Date().toLocaleDateString(
    (typeof navigator !== 'undefined' && navigator.language) || 'en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }
  );
}
