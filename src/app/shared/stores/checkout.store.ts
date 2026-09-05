// ============================================================
// GadgetPlanet — Checkout Signal Store
// ============================================================
import { computed, Injectable, signal } from '@angular/core';

export type CheckoutStep = 1 | 2 | 3;

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  type: 'Home' | 'Work';
  isDefault: boolean;
}

export type PaymentMethodId =
  | 'card'
  | 'jazzcash_easypaisa'
  | 'cod'
  | 'intl';

export interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
  detailsNote: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  // ── State ──────────────────────────────────────────────────
  readonly currentStep = signal<CheckoutStep>(1);

  readonly savedAddresses = signal<Address[]>([
    {
      id: 'addr-1',
      fullName: 'Hamza Tariq',
      phone: '0300-9482156',
      streetAddress: 'House 42-B, Sector Y, Phase 3, DHA',
      city: 'Lahore',
      postalCode: '54792',
      type: 'Home',
      isDefault: true,
    },
    {
      id: 'addr-2',
      fullName: 'Hamza Tariq',
      phone: '0321-4589201',
      streetAddress: 'Suite 304, TechnoCity Corporate Tower, I.I. Chundrigar Rd',
      city: 'Karachi',
      postalCode: '74200',
      type: 'Work',
      isDefault: false,
    },
  ]);

  readonly selectedAddressId = signal<string>('addr-1');
  readonly selectedPaymentMethod = signal<PaymentMethodId>('cod');
  readonly isAddingNewAddress = signal<boolean>(false);

  readonly orderPlaced = signal<boolean>(false);
  readonly orderNumber = signal<string | null>(null);
  readonly orderDate = signal<string | null>(null);

  // Available Payment Options
  readonly paymentOptions: PaymentOption[] = [
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      subtitle: 'Pay with physical cash when the courier arrives at your door',
      badge: 'Most Popular',
      icon: '💵',
      detailsNote: 'Please keep exact change ready. Dispatched via Express Courier with live tracking SMS.',
    },
    {
      id: 'card',
      title: 'Debit / Credit Card',
      subtitle: 'Visa, Mastercard & PayPak accepted with 256-Bit SSL protection',
      badge: 'Instant & Secure',
      icon: '💳',
      detailsNote: 'Zero transaction surcharge. Your card details are never stored on our servers.',
    },
    {
      id: 'jazzcash_easypaisa',
      title: 'JazzCash / Easypaisa',
      subtitle: 'Direct mobile wallet transfer or MPIN authorization',
      badge: 'Mobile Wallet',
      icon: '📱',
      detailsNote: 'Authorize payment instantly on your mobile app or via automated USSD prompt.',
    },
    {
      id: 'intl',
      title: 'International Cards / UnionPay',
      subtitle: 'Overseas credit/debit cards accepted in equivalent PKR',
      icon: '🌐',
      detailsNote: 'Currency conversion applied by your issuing card bank.',
    },
  ];

  // ── Selectors ──────────────────────────────────────────────
  readonly selectedAddress = computed<Address>(() => {
    const list = this.savedAddresses();
    return list.find(a => a.id === this.selectedAddressId()) ?? list[0];
  });

  readonly selectedPayment = computed<PaymentOption>(() => {
    return (
      this.paymentOptions.find(p => p.id === this.selectedPaymentMethod()) ??
      this.paymentOptions[0]
    );
  });

  // ── Actions ────────────────────────────────────────────────
  setStep(step: CheckoutStep): void {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    const next = Math.min(this.currentStep() + 1, 3) as CheckoutStep;
    this.setStep(next);
  }

  prevStep(): void {
    const prev = Math.max(this.currentStep() - 1, 1) as CheckoutStep;
    this.setStep(prev);
  }

  selectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  toggleNewAddressForm(): void {
    this.isAddingNewAddress.update(v => !v);
  }

  addAddress(address: Omit<Address, 'id' | 'isDefault'>): void {
    const newId = `addr-${Date.now()}`;
    const newAddr: Address = {
      ...address,
      id: newId,
      isDefault: false,
    };
    this.savedAddresses.update(list => [newAddr, ...list]);
    this.selectedAddressId.set(newId);
    this.isAddingNewAddress.set(false);
  }

  selectPaymentMethod(method: PaymentMethodId): void {
    this.selectedPaymentMethod.set(method);
  }

  placeOrder(): string {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderId = `GP-2026-${randomId}`;
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    this.orderNumber.set(orderId);
    this.orderDate.set(now);
    this.orderPlaced.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return orderId;
  }

  resetCheckout(): void {
    this.currentStep.set(1);
    this.orderPlaced.set(false);
    this.orderNumber.set(null);
    this.orderDate.set(null);
    this.isAddingNewAddress.set(false);
  }
}
