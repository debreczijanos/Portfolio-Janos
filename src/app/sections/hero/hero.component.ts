import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit {
  title1Chars: string[] = [];
  title2Chars: string[] = [];

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('de');
    translate.use('de');
  }

  ngOnInit(): void {
    this.translate.get('HERO_TITLE').subscribe((text: string) => {
      this.title1Chars = text.split('');
    });
    this.translate.get('HERO_TITLE2').subscribe((text: string) => {
      this.title2Chars = text.split('');
    });
  }
}
