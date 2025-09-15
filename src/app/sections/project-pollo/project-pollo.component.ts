import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-project-pollo',
  imports: [CommonModule, RouterModule, TranslateModule, FooterComponent],
  templateUrl: './project-pollo.component.html',
  styleUrls: ['./project-pollo.component.scss'],
})
export class ProjectPolloComponent {}

