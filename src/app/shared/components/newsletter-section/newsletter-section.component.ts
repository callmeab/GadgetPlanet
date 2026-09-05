import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gp-newsletter-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newsletter-section.component.html',
  styleUrl: './newsletter-section.component.scss',
})
export class NewsletterSectionComponent {
  @Input() title = 'Stay in the Planet Orbit 🚀';
  @Input() subtitle =
    'Subscribe for VIP gadget drops, secret flash sales, in-depth tech reviews & Rs. 500 discount voucher straight to your inbox.';

  readonly emailInput = signal<string>('');
  readonly isSubscribed = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly voucherCode = 'PLANETVIP500';
  readonly isCopied = signal<boolean>(false);

  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailInput.set(target.value);
    if (this.errorMessage()) {
      this.errorMessage.set(null);
    }
  }

  handleSubscribe(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const email = this.emailInput().trim();
    if (!email) {
      this.errorMessage.set('Please enter your email address to subscribe.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage.set('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    this.errorMessage.set(null);
    this.isSubscribed.set(true);
  }

  resetSubscription(): void {
    this.isSubscribed.set(false);
    this.emailInput.set('');
    this.errorMessage.set(null);
    this.isCopied.set(false);
  }

  copyVoucher(): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.voucherCode).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2500);
      });
    } else {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    }
  }
}
