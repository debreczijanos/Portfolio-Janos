import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { AboutMeComponent } from '../about-me/about-me.component';
import { SkillsComponent } from '../skills/skills.component';
import { ProjectsComponent } from '../projects/projects.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    HeroComponent,
    AboutMeComponent,
    SkillsComponent,
    ProjectsComponent,
    TestimonialsComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
