import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { HeroComponent } from './sections/hero/hero.component';
import { AboutMeComponent } from './sections/about-me/about-me.component';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutMeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Portfolio-Janos';
}
