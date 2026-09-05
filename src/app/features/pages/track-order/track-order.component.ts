import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StaticPageLayoutComponent } from '../../../shared/components/static-page-layout/static-page-layout.component';

export interface TrackingStep {
  stepNum: number;
  title: string;
  location: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

@Component({
  selector: 'gp-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StaticPageLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.scss',
})
export class TrackOrderComponent {
  orderIdInput = 'GP-2026-84920';
  contactInput = 'hamza@example.com';

  readonly isSearching = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(true); // Pre-loaded for instant interactive preview
  readonly searchError = signal<string | null>(null);

  readonly trackingSteps: TrackingStep[] = [
    {
      stepNum: 1,
      title: 'Order Confirmed & Payment Verified',
      location: 'GadgetPlanet Lahore Fulfillment Center',
      time: 'Sept 04, 2026 — 11:20 AM',
      status: 'completed',
      icon: '✓',
    },
    {
      stepNum: 2,
      title: 'Quality Checked & Sealed for Express Dispatch',
      location: 'GadgetPlanet Tech Hub, Lahore',
      time: 'Sept 04, 2026 — 04:30 PM',
      status: 'completed',
      icon: '✓',
    },
    {
      stepNum: 3,
      title: 'In Transit with Express Courier (Air Freight)',
      location: 'TCS Cargo Logistics Hub, Lahore Hub → Regional Sort',
      time: 'Sept 05, 2026 — 08:15 AM',
      status: 'current',
      icon: '🚚',
    },
    {
      stepNum: 4,
      title: 'Out for Doorstep Delivery',
      location: 'Destination Area Station',
      time: 'Expected Delivery: Today before 6:00 PM',
      status: 'pending',
      icon: '📦',
    },
  ];

  readonly shipmentItems = [
    {
      name: 'AirBass Pro X1 Wireless Earbuds',
      variant: 'Midnight Black',
      qty: 1,
      price: 2499,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80',
    },
    {
      name: 'QuantumBoom 360 Bluetooth Speaker',
      variant: 'Obsidian Black',
      qty: 1,
      price: 6499,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80',
    },
  ];

  onTrack(): void {
    if (!this.orderIdInput.trim()) {
      this.searchError.set('Please enter a valid Order ID.');
      return;
    }

    this.searchError.set(null);
    this.isSearching.set(true);

    setTimeout(() => {
      this.isSearching.set(false);
      this.hasSearched.set(true);
    }, 450);
  }
}
