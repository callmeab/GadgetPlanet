import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminToastService } from '../../shared/services/admin-toast.service';
import { AdminModalComponent } from '../../shared/components/admin-modal/admin-modal.component';

@Component({
  selector: 'gp-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    AdminModalComponent,
  ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastService = inject(AdminToastService);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['admin@gadgetplanet.com', [Validators.required, Validators.email]],
    password: ['Admin@2026', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  // UI state signals
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  loginError = signal<string | null>(null);

  // Forgot password modal signals
  showForgotPasswordModal = signal<boolean>(false);
  forgotEmail = signal<string>('');
  forgotSubmitted = signal<boolean>(false);

  // Form field getters for clean template checks
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Simulate authentication delay
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Signed in successfully as Administrator.', 'Welcome Back');
      this.router.navigate(['/admin/dashboard']);
    }, 700);
  }

  openForgotPassword(event: Event): void {
    event.preventDefault();
    this.forgotEmail.set(this.loginForm.get('email')?.value || '');
    this.forgotSubmitted.set(false);
    this.showForgotPasswordModal.set(true);
  }

  closeForgotPassword(): void {
    this.showForgotPasswordModal.set(false);
  }

  submitForgotPassword(): void {
    const emailVal = this.forgotEmail().trim();
    if (!emailVal || !emailVal.includes('@')) {
      this.toastService.error('Please enter a valid work email address.');
      return;
    }

    this.forgotSubmitted.set(true);
    this.toastService.success(`A password reset link has been dispatched to ${emailVal}`);
  }
}
