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
  private readonly nameValidators = [
    Validators.required,
    Validators.pattern(/^[\p{L}]+(?:\s[\p{L}]+)*$/u),
  ];
  private readonly emailValidators = [
    Validators.required,
    Validators.email,
    Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
  ];
  private readonly messageValidators = [
    Validators.required,
    Validators.minLength(14),
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  contactForm!: FormGroup;

  ngOnInit(): void {
    this.contactForm = this.buildForm();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: this.fb.control('', this.nameValidators),
      email: this.fb.control('', this.emailValidators),
      message: this.fb.control('', this.messageValidators),
      consent: this.fb.control(false, [Validators.requiredTrue]),
      company: this.fb.control(''),
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initSectionLineObserver(), 100);
    }
  }

  private initSectionLineObserver(): void {
    const scribbles = this.queryScribbles();
    if (!scribbles.length) return;

    this.observer = this.createScribbleObserver();
    scribbles.forEach((el) => this.observer!.observe(el));
  }

  private queryScribbles(): NodeListOf<HTMLElement> {
    return document.querySelectorAll<HTMLElement>('.contact__scribble');
  }

  private createScribbleObserver(): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => entries.forEach((entry) => this.toggleScribble(entry)),
      { threshold: 0.1, rootMargin: '-50px 0px -50px 0px' }
    );
  }

  private toggleScribble(entry: IntersectionObserverEntry): void {
    const el = entry.target as HTMLElement;
    el.classList.toggle('active', entry.isIntersecting);
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
    this.markSubmissionStart();
    if (this.blockSubmission()) return;

    this.sendForm();
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

  private markSubmissionStart(): void {
    this.submitted = true;
    this.sent = false;
    this.sendError = false;
  }

  private blockSubmission(): boolean {
    if (this.contactForm.get('company')?.value) return true;
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return true;
    }
    return false;
  }

  private sendForm(): void {
    const payload = this.extractPayload();
    this.sending = true;
    this.contactService.send(payload).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  private extractPayload(): { name: string; email: string; message: string } {
    const { name = '', email = '', message = '' } =
      this.contactForm.getRawValue();
    return { name, email, message };
  }

  private handleSuccess(): void {
    this.sending = false;
    this.showSuccessOverlay();
    this.resetForm();
    this.submitted = false;
  }

  private handleError(): void {
    this.sending = false;
    this.sendError = true;
  }

  private resetForm(): void {
    this.contactForm.reset({
      name: '',
      email: '',
      message: '',
      consent: false,
      company: '',
    });
  }
}
