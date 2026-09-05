import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckoutStep, CheckoutStore, PaymentMethodId } from '../../shared/stores/checkout.store';
import { CartStore } from '../../shared/stores/cart.store';

@Component({
  selector: 'gp-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  readonly checkoutStore = inject(CheckoutStore);
  readonly cartStore = inject(CartStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly mobileSummaryOpen = signal<boolean>(false);
  readonly isPlacingOrder = signal<boolean>(false);

  // ── New Address Form ────────────────────────────────────────
  readonly newAddressForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+\\s-]{10,15}$')]],
    streetAddress: ['', [Validators.required, Validators.minLength(5)]],
    city: ['Lahore', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    type: ['Home', [Validators.required]],
  });

  readonly pakistaniCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Peshawar',
    'Multan',
    'Sialkot',
    'Gujranwala',
    'Quetta',
    'Hyderabad',
  ];

  toggleMobileSummary(): void {
    this.mobileSummaryOpen.update(v => !v);
  }

  goToStep(step: CheckoutStep): void {
    this.checkoutStore.setStep(step);
  }

  selectAddress(id: string): void {
    this.checkoutStore.selectAddress(id);
  }

  selectPayment(id: PaymentMethodId): void {
    this.checkoutStore.selectPaymentMethod(id);
  }

  toggleNewAddressForm(): void {
    this.checkoutStore.toggleNewAddressForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.newAddressForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSaveNewAddress(): void {
    if (this.newAddressForm.invalid) {
      this.newAddressForm.markAllAsTouched();
      return;
    }

    const val = this.newAddressForm.value;
    this.checkoutStore.addAddress({
      fullName: val.fullName,
      phone: val.phone,
      streetAddress: val.streetAddress,
      city: val.city,
      postalCode: val.postalCode,
      type: val.type,
    });

    this.newAddressForm.reset({
      city: 'Lahore',
      type: 'Home',
    });
  }

  onPlaceOrder(): void {
    this.isPlacingOrder.set(true);

    setTimeout(() => {
      this.isPlacingOrder.set(false);
      this.checkoutStore.placeOrder();
    }, 700);
  }

  startShoppingAgain(): void {
    this.checkoutStore.resetCheckout();
    this.router.navigate(['/products']);
  }
}
