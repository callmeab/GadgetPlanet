import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaticPageLayoutComponent } from '../../../shared/components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'gp-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StaticPageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal<boolean>(false);
  readonly isSent = signal<boolean>(false);

  readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern('^[0-9+\\s-]{10,15}$')]],
    subject: ['Order & Delivery Status', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly subjects = [
    'Order & Delivery Status',
    'Warranty Claim & Repairs',
    'Product Inquiry & Recommendation',
    'Returns & Exchanges',
    'Corporate & Bulk Inquiries',
    'Other Questions',
  ];

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.contactForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSent.set(true);
      this.contactForm.reset({
        subject: 'Order & Delivery Status',
      });
    }, 500);
  }

  sendAnother(): void {
    this.isSent.set(false);
  }
}
