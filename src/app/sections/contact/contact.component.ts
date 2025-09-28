import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ContactService } from '../../core/services/contact.service';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FooterComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  sending = false;
  submitted = false;
  private overlayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private overlayScrollLocked = false;

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
        [Validators.required, Validators.pattern(/^[\p{L}]+(?:\s[\p{L}]+)*$/u)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
        ],
      ],
      message: ['', [Validators.required, Validators.minLength(14)]],
      consent: [false, [Validators.requiredTrue]],
      company: [''],
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const scribbles =
      document.querySelectorAll<HTMLElement>('.contact__scribble');
    if (!scribbles.length) return;

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

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
      this.overlayTimeoutId = null;
    }
    this.unlockBodyScroll();
  }

  onSubmit(): void {
    this.submitted = true;
    this.sent = false;
    this.sendError = false;
    if (this.contactForm.get('company')?.value) return;
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const name = this.contactForm.get('name')?.value ?? '';
    const email = this.contactForm.get('email')?.value ?? '';
    const message = this.contactForm.get('message')?.value ?? '';

    this.sending = true;
    this.contactService.send({ name, email, message }).subscribe({
      next: () => {
        this.sending = false;
        this.showSuccessOverlay();
        this.contactForm.reset({
          name: '',
          email: '',
          message: '',
          consent: false,
          company: '',
        });
        this.submitted = false;
      },
      error: () => {
        this.sending = false;
        this.sendError = true;
      },
    });
  }

  sent = false;
  sendError = false;

  closeOverlay(): void {
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
      this.overlayTimeoutId = null;
    }
    if (!this.sent) return;
    this.sent = false;
    this.unlockBodyScroll();
  }

  isInvalid(controlName: 'name' | 'email' | 'message' | 'consent'): boolean {
    const c = this.contactForm.get(controlName);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  private showSuccessOverlay(): void {
    this.sent = true;
    this.lockBodyScroll();
    if (this.overlayTimeoutId) {
      clearTimeout(this.overlayTimeoutId);
    }
    this.overlayTimeoutId = setTimeout(() => {
      this.overlayTimeoutId = null;
      this.closeOverlay();
    }, 6000);
  }

  private lockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.overlayScrollLocked) return;
    document.body.classList.add('contact-overlay-open');
    this.overlayScrollLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId) || !this.overlayScrollLocked)
      return;
    document.body.classList.remove('contact-overlay-open');
    this.overlayScrollLocked = false;
  }
}
