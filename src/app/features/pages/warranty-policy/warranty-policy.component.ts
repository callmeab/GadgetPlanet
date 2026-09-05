import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaticPageLayoutComponent } from '../../../shared/components/static-page-layout/static-page-layout.component';

@Component({
  selector: 'gp-warranty-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, StaticPageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './warranty-policy.component.html',
  styleUrl: './warranty-policy.component.scss',
})
export class WarrantyPolicyComponent {
  readonly claimSteps = [
    {
      step: '01',
      title: 'Submit Claim Details',
      desc: 'Contact our team via our website or WhatsApp with your Order ID, device serial number, and a brief description of the fault.',
    },
    {
      step: '02',
      title: 'Virtual Diagnostic',
      desc: 'Our Lahore audio technicians review your issue within 2 to 4 hours and guide you through quick troubleshooting steps if needed.',
    },
    {
      step: '03',
      title: 'Free Courier Collection',
      desc: 'If hardware fault is confirmed, our courier partner TCS picks up the defective unit directly from your home at zero cost.',
    },
    {
      step: '04',
      title: 'Replacement Dispatched',
      desc: 'Upon verification at our Lahore service facility, a factory-sealed replacement unit is dispatched within 48 hours.',
    },
  ];
}
