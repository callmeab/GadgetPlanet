import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'gp-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly authMode = signal<'login' | 'signup'>('login');
  readonly loginMethod = signal<'password' | 'otp'>('password');
  readonly showPassword = signal<boolean>(false);
  readonly showSignupPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly submitSuccess = signal<string | null>(null);

  // ── Reactive Forms ──────────────────────────────────────────
  readonly loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required, this.identifierValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    otp: ['', [Validators.pattern('^[0-9]{6}$')]],
    rememberMe: [true],
  });

  readonly signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern('^([0-9+\\s-]{10,15})$'),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    terms: [false, [Validators.requiredTrue]],
  });

  ngOnInit(): void {
    // Determine mode from route path
    const path = this.route.snapshot.routeConfig?.path;
    if (path === 'signup' || this.router.url.includes('signup')) {
      this.authMode.set('signup');
    } else {
      this.authMode.set('login');
    }
  }

  // ── Mode & Visibility Controls ──────────────────────────────
  switchMode(mode: 'login' | 'signup'): void {
    this.authMode.set(mode);
    this.submitSuccess.set(null);
    this.router.navigate([mode === 'signup' ? '/signup' : '/login'], {
      replaceUrl: true,
    });
  }

  setLoginMethod(method: 'password' | 'otp'): void {
    this.loginMethod.set(method);
    const passwordCtrl = this.loginForm.get('password');
    const otpCtrl = this.loginForm.get('otp');

    if (method === 'otp') {
      passwordCtrl?.clearValidators();
      otpCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{6}$')]);
    } else {
      otpCtrl?.clearValidators();
      passwordCtrl?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    passwordCtrl?.updateValueAndValidity();
    otpCtrl?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleSignupPasswordVisibility(): void {
    this.showSignupPassword.update(v => !v);
  }

  dismissSuccess(): void {
    this.submitSuccess.set(null);
  }

  // ── Custom Validators ───────────────────────────────────────
  private identifierValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value?.trim();
    if (!val) return null;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isPhone = /^[0-9+\s-]{10,15}$/.test(val);

    if (!isEmail && !isPhone) {
      return { invalidIdentifier: true };
    }
    return null;
  }

  // ── Validation Helpers ──────────────────────────────────────
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required.';
    if (errors['requiredTrue']) return 'You must accept the terms to continue.';
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['invalidIdentifier'])
      return 'Please enter a valid email address or phone number.';
    if (errors['minlength'])
      return `Must be at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['pattern']) {
      if (fieldName === 'phone') return 'Please enter a valid 10-11 digit phone number.';
      if (fieldName === 'otp') return 'OTP must be exactly 6 digits.';
      return 'Invalid format.';
    }
    return 'Invalid input.';
  }

  // ── Form Submissions ────────────────────────────────────────
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const identifier = this.loginForm.value.identifier;

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(`Welcome back! Successfully authenticated as ${identifier}.`);
    }, 600);
  }

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const name = this.signupForm.value.name;

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(
        `Welcome to GadgetPlanet, ${name}! Your account has been created. A Rs. 500 welcome voucher has been added to your bag.`
      );
    }, 600);
  }
}
