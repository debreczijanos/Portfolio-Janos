import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, TranslateModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  sending = false;
  submitted = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  contactForm!: FormGroup;

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          // Nur Buchstaben (inkl. Umlaute/diakritische), optional Leerzeichen zwischen Wörtern
          Validators.pattern(/^[\p{L}]+(?:\s[\p{L}]+)*$/u),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(14)]],
      consent: [false, [Validators.requiredTrue]],
      // Honeypot gegen Bots – muss leer bleiben
      company: [''],
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const scribbles = document.querySelectorAll<HTMLElement>('.contact__scribble');
    if (!scribbles.length) return;

    // One observer for all scribbles; toggles 'active' per target
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );

    scribbles.forEach((el) => this.observer!.observe(el));
  }

  // Legacy helper functions kept during refactor; not used anymore

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  onSubmit(): void {
    this.submitted = true;
    this.sent = false;
    this.sendError = false;
    // Blockieren, wenn Honeypot gefüllt ist (Bot) oder Formular ungültig
    if (this.contactForm.get('company')?.value) return;
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const name = this.contactForm.get('name')?.value ?? '';
    const email = this.contactForm.get('email')?.value ?? '';
    const message = this.contactForm.get('message')?.value ?? '';

    this.sending = true;
    this.contactService
      .send({ name, email, message })
      .subscribe({
        next: () => {
          this.sending = false;
          this.sent = true;
          this.contactForm.reset({ name: '', email: '', message: '', consent: false, company: '' });
          this.submitted = false; // keine Fehlermeldungen nach erfolgreichem Versand anzeigen
        },
        error: () => {
          this.sending = false;
          this.sendError = true;
        },
      });
  }

  sent = false;
  sendError = false;

  isInvalid(controlName: 'name' | 'email' | 'message' | 'consent'): boolean {
    const c = this.contactForm.get(controlName);
    return !!c && c.invalid && (c.touched || this.submitted);
  }
}
