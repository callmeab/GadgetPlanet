import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaticPageLayoutComponent } from '../../../shared/components/static-page-layout/static-page-layout.component';

export interface FaqItem {
  id: string;
  category: 'shipping' | 'warranty' | 'payment' | 'products';
  question: string;
  answer: string;
}

@Component({
  selector: 'gp-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, StaticPageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly selectedCategory = signal<string>('all');
  readonly openFaqId = signal<string | null>('faq-1');

  readonly categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'shipping', label: 'Orders & Shipping' },
    { id: 'warranty', label: 'Warranty & Claims' },
    { id: 'payment', label: 'Payment & COD' },
    { id: 'products', label: 'Product Support' },
  ];

  readonly faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'shipping',
      question: 'What is the estimated delivery time across Pakistan?',
      answer:
        'Deliveries in Lahore and Karachi typically arrive within 24 hours. For Islamabad, Rawalpindi, Faisalabad, Peshawar, and other major cities, delivery takes 1 to 2 business days via TCS Air Freight. Remote regional destinations take 2 to 3 days.',
    },
    {
      id: 'faq-2',
      category: 'shipping',
      question: 'How do I qualify for FREE shipping?',
      answer:
        'All orders with an item subtotal of Rs. 999 or higher automatically unlock FREE Express Delivery anywhere in Pakistan. For orders below Rs. 999, a flat delivery fee of Rs. 99 applies.',
    },
    {
      id: 'faq-3',
      category: 'warranty',
      question: 'How does the 1-Year Official Brand Warranty work?',
      answer:
        'Every gadget purchased on GadgetPlanet is backed by our direct 1-Year Brand Claim Warranty. If your device develops an internal hardware, audio driver, or battery fault, contact us with your order ID. We will either repair it at our Lahore service center or dispatch a brand-new replacement unit within 48 hours.',
    },
    {
      id: 'faq-4',
      category: 'warranty',
      question: 'What is your 30-Day Easy Replacement Policy?',
      answer:
        'If your item arrives defective, damaged in transit, or has missing accessories, notify our support team within 30 days of receipt. We will arrange a free reverse pickup and dispatch a fresh replacement unit at zero additional cost.',
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: 'Can I pay via Cash on Delivery (COD)?',
      answer:
        'Yes! Cash on Delivery is available nationwide across 200+ cities in Pakistan with no extra surcharge. Simply pay physical cash to the courier representative when the parcel arrives at your doorstep.',
    },
    {
      id: 'faq-6',
      category: 'payment',
      question: 'Which online payment methods do you support?',
      answer:
        'We support all major Pakistani debit and credit cards (Visa, Mastercard, PayPak) protected by 256-bit SSL encryption. We also accept direct mobile wallet transfers through JazzCash and Easypaisa, as well as international cards for overseas orders.',
    },
    {
      id: 'faq-7',
      category: 'products',
      question: 'Are GadgetPlanet products 100% original and authentic?',
      answer:
        'Yes, unconditionally. GadgetPlanet is an authorized direct distributor for all listed brands. Every product box comes factory-sealed with verifiable serial numbers and official hologram security seals. We do not sell open-box, refurbished, or counterfeit products.',
    },
    {
      id: 'faq-8',
      category: 'products',
      question: 'How do I pair or factory-reset my Bluetooth earbuds?',
      answer:
        'Place both earbuds in the charging case, leave the lid open, and press & hold the setup button on the back of the case for 10 seconds until the LED flashes red and white. Then open your phone’s Bluetooth menu and select your device name to reconnect.',
    },
    {
      id: 'faq-9',
      category: 'shipping',
      question: 'Can I open the parcel before paying the courier on COD?',
      answer:
        'Standard Pakistani courier regulations require payment and signature prior to parcel unboxing. However, your purchase is completely safeguarded under our 30-Day Replacement Guarantee: if anything is amiss after opening, our team will instantly replace it.',
    },
  ];

  readonly filteredFaqs = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.faqs;
    return this.faqs.filter(f => f.category === cat);
  });

  selectCategory(id: string): void {
    this.selectedCategory.set(id);
  }

  toggleFaq(id: string): void {
    if (this.openFaqId() === id) {
      this.openFaqId.set(null);
    } else {
      this.openFaqId.set(id);
    }
  }

  isOpen(id: string): boolean {
    return this.openFaqId() === id;
  }
}
