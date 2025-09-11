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
    const contactLine = document.getElementById('contact-scribble');
    if (contactLine) {
      this.observer = this.createIntersectionObserver(contactLine);
      this.observer.observe(contactLine);
    }
  }

  private createIntersectionObserver(
    contactLine: HTMLElement
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => this.handleIntersection(entries, contactLine),
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );
  }

  private handleIntersection(
    entries: IntersectionObserverEntry[],
    contactLine: HTMLElement
  ): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        contactLine.classList.add('active');
      } else {
        contactLine.classList.remove('active');
      }
    });
  }

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
