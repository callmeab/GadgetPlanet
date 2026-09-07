import { Injectable, signal } from '@angular/core';

export interface AdminKpiMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  badgeText?: string;
}

export interface AdminOrderTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'placed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'note';
  user?: string;
}

export interface AdminOrderItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  fulfillmentStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  city?: string;
  country?: string;
  postalCode?: string;
  carrier?: string;
  trackingNumber?: string;
  itemsCount: number;
  items: AdminOrderItem[];
  notes?: string;
  timeline?: AdminOrderTimelineEvent[];
}

export interface CustomerAddress {
  id: string;
  isDefault: boolean;
  label: string; // e.g. "Home", "Office"
  recipientName: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinedDate: string;
  status: 'Active' | 'VIP' | 'New' | 'Inactive';
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  notes?: string;
  addresses: CustomerAddress[];
}

export interface ProductVariantOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  combination: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface AdminProductMedia {
  id: string;
  url: string;
  isPrimary: boolean;
  altText?: string;
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  chargeTax?: boolean;
  stock: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  continueSellingWhenOutOfStock?: boolean;
  status: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock';
  salesCount: number;
  imageUrl?: string;
  images?: AdminProductMedia[];
  description?: string;
  tags?: string[];
  hasVariants?: boolean;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  seo?: {
    title: string;
    description: string;
    slug: string;
  };
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminMockDataService {
  // 4 Top Row KPI Metrics (Total Sales, Total Orders, Total Customers, Total Products)
  readonly metrics = signal<AdminKpiMetric[]>([
    {
      id: 'sales',
      title: 'Total Sales',
      value: '$148,290.00',
      change: 14.6,
      changeLabel: 'vs last period',
      badgeText: 'Live'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '1,842',
      change: 8.3,
      changeLabel: 'vs last period',
      badgeText: '30d'
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: '4,120',
      change: 24.1,
      changeLabel: 'vs last period',
      badgeText: 'Live'
    },
    {
      id: 'products',
      title: 'Total Products',
      value: '86',
      change: 4.2,
      changeLabel: 'vs last period',
      badgeText: 'Catalog'
    }
  ]);

  // Sales Chart Datasets for range filter
  readonly chartDataSets: Record<'7d' | '30d' | 'year', ChartDataPoint[]> = {
    '7d': [
      { label: 'Mon', revenue: 3400, orders: 42 },
      { label: 'Tue', revenue: 4200, orders: 55 },
      { label: 'Wed', revenue: 3900, orders: 48 },
      { label: 'Thu', revenue: 5800, orders: 72 },
      { label: 'Fri', revenue: 7600, orders: 94 },
      { label: 'Sat', revenue: 9200, orders: 118 },
      { label: 'Sun', revenue: 6400, orders: 81 }
    ],
    '30d': [
      { label: 'Sep 1', revenue: 12400, orders: 160 },
      { label: 'Sep 5', revenue: 16800, orders: 210 },
      { label: 'Sep 10', revenue: 14500, orders: 185 },
      { label: 'Sep 15', revenue: 22100, orders: 275 },
      { label: 'Sep 20', revenue: 26400, orders: 320 },
      { label: 'Sep 25', revenue: 29800, orders: 365 },
      { label: 'Sep 30', revenue: 34200, orders: 422 }
    ],
    'year': [
      { label: 'Jan', revenue: 78000, orders: 980 },
      { label: 'Feb', revenue: 86000, orders: 1090 },
      { label: 'Mar', revenue: 104000, orders: 1320 },
      { label: 'Apr', revenue: 112000, orders: 1410 },
      { label: 'May', revenue: 125000, orders: 1560 },
      { label: 'Jun', revenue: 138000, orders: 1710 },
      { label: 'Jul', revenue: 131000, orders: 1640 },
      { label: 'Aug', revenue: 142000, orders: 1780 },
      { label: 'Sep', revenue: 148290, orders: 1842 }
    ]
  };

  // Orders Mock Data (Diverse fulfillment statuses: Pending, Processing, Shipped, Delivered, Cancelled)
  readonly orders = signal<AdminOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-9842',
      customerName: 'Ahmad Khan',
      customerEmail: 'ahmad.khan@example.com',
      customerPhone: '+92 300 1234567',
      date: '2026-09-05',
      subtotal: 349.99,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 349.99,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'House 45, Street 12, F-8/2',
      city: 'Islamabad',
      country: 'Pakistan',
      postalCode: '44000',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-928410294',
      notes: 'Customer requested leave package at front desk with security guard.',
      itemsCount: 2,
      items: [
        { productName: 'Sony WH-1000XM5 Wireless Headphones', sku: 'SON-XM5-BLK', quantity: 1, unitPrice: 299.99, totalPrice: 299.99, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80' },
        { productName: 'Anker 65W GaN Fast Charger', sku: 'ANK-65W-WHT', quantity: 1, unitPrice: 50.00, totalPrice: 50.00, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80' }
      ],
      timeline: [
        { id: 't1', title: 'Package Delivered', description: 'Delivered to recipient in Islamabad by courier (TCS Express).', date: '2026-09-05T14:30:00Z', type: 'delivered' },
        { id: 't2', title: 'Out for Delivery', description: 'Package out for local delivery in Islamabad hub.', date: '2026-09-05T09:15:00Z', type: 'shipped' },
        { id: 't3', title: 'Order Shipped', description: 'Dispatched via TCS Express. Tracking ID: TCS-928410294.', date: '2026-09-04T16:00:00Z', type: 'shipped' },
        { id: 't4', title: 'Payment Confirmed', description: 'Card payment of $349.99 captured successfully.', date: '2026-09-04T11:05:00Z', type: 'paid' },
        { id: 't5', title: 'Order Placed', description: 'Customer placed order through online checkout.', date: '2026-09-04T11:00:00Z', type: 'placed' }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-9841',
      customerName: 'Fatima Zahra',
      customerEmail: 'f.zahra@example.com',
      customerPhone: '+92 321 7654321',
      date: '2026-09-05',
      subtotal: 129.50,
      shippingFee: 10.00,
      tax: 0,
      discount: 10.00,
      total: 129.50,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Processing',
      paymentMethod: 'JazzCash',
      shippingAddress: 'Apartment 3B, DHA Phase 5',
      city: 'Lahore',
      country: 'Pakistan',
      postalCode: '54792',
      carrier: 'Leopard Courier',
      trackingNumber: 'LEO-771239841',
      notes: 'Priority shipping requested for birthday gift.',
      itemsCount: 1,
      items: [
        { productName: 'Logitech MX Master 3S Wireless Mouse', sku: 'LOG-MX3S-GRY', quantity: 1, unitPrice: 129.50, totalPrice: 129.50, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&q=80' }
      ],
      timeline: [
        { id: 't21', title: 'Packing in Warehouse', description: 'Item picked and packed into dispatch box.', date: '2026-09-05T12:00:00Z', type: 'processing' },
        { id: 't22', title: 'Payment Confirmed', description: 'Received via JazzCash mobile wallet.', date: '2026-09-05T10:45:00Z', type: 'paid' },
        { id: 't23', title: 'Order Placed', description: 'Customer placed order through mobile storefront.', date: '2026-09-05T10:42:00Z', type: 'placed' }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-9840',
      customerName: 'Bilal Tariq',
      customerEmail: 'bilal.tariq@example.com',
      customerPhone: '+92 333 9876543',
      date: '2026-09-04',
      subtotal: 589.00,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 589.00,
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Pending',
      paymentMethod: 'Cash on Delivery (COD)',
      shippingAddress: 'Plot 108, Block C, Gulshan-e-Iqbal',
      city: 'Karachi',
      country: 'Pakistan',
      postalCode: '75300',
      carrier: 'Call Courier',
      notes: 'Please verify phone number before dispatch.',
      itemsCount: 3,
      items: [
        { productName: 'Keychron Q1 Pro Wireless Keyboard', sku: 'KEY-Q1P-RGB', quantity: 1, unitPrice: 199.00, totalPrice: 199.00, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80' },
        { productName: 'BenQ ScreenBar Pro Monitor Light', sku: 'BNQ-SCR-PRO', quantity: 1, unitPrice: 140.00, totalPrice: 140.00, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80' },
        { productName: 'CalDigit TS4 Thunderbolt 4 Dock', sku: 'CAL-TS4-SIL', quantity: 1, unitPrice: 250.00, totalPrice: 250.00, imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=100&q=80' }
      ],
      timeline: [
        { id: 't31', title: 'Order Verification Required', description: 'COD order waiting for customer phone confirmation.', date: '2026-09-04T17:10:00Z', type: 'placed' }
      ]
    },
    {
      id: '4',
      orderNumber: 'ORD-9839',
      customerName: 'Zainab Bibi',
      customerEmail: 'zainab.b@example.com',
      customerPhone: '+92 345 5551234',
      date: '2026-09-04',
      subtotal: 89.99,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 89.99,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Shipped',
      paymentMethod: 'Easypaisa',
      shippingAddress: 'Street 4, Sector G-11/3',
      city: 'Islamabad',
      country: 'Pakistan',
      postalCode: '44000',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-889912301',
      itemsCount: 1,
      items: [
        { productName: 'Apple MagSafe Battery Pack 5000mAh', sku: 'APP-MAG-BAT', quantity: 1, unitPrice: 89.99, totalPrice: 89.99, imageUrl: 'https://images.unsplash.com/photo-1609592424368-e6922d56c4d7?w=100&q=80' }
      ],
      timeline: [
        { id: 't41', title: 'Handed to Courier', description: 'Dispatched via TCS Express. Tracking ID: TCS-889912301.', date: '2026-09-04T15:20:00Z', type: 'shipped' },
        { id: 't42', title: 'Payment Confirmed', description: 'Payment of $89.99 received via Easypaisa.', date: '2026-09-04T14:10:00Z', type: 'paid' },
        { id: 't43', title: 'Order Placed', description: 'Order created online.', date: '2026-09-04T14:00:00Z', type: 'placed' }
      ]
    },
    {
      id: '5',
      orderNumber: 'ORD-9838',
      customerName: 'Hamza Ali',
      customerEmail: 'hamza.ali@example.com',
      customerPhone: '+92 312 4443322',
      date: '2026-09-04',
      subtotal: 420.00,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 420.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'Model Town, Block B',
      city: 'Lahore',
      country: 'Pakistan',
      postalCode: '54700',
      carrier: 'TCS Express',
      trackingNumber: 'TCS-998811223',
      itemsCount: 2,
      items: [
        { productName: 'DJI Mic 2 Wireless Microphone System', sku: 'DJI-MIC-2', quantity: 1, unitPrice: 349.00, totalPrice: 349.00, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&q=80' },
        { productName: 'SanDisk 256GB Extreme PRO SDXC', sku: 'SND-SD-256', quantity: 1, unitPrice: 71.00, totalPrice: 71.00, imageUrl: 'https://images.unsplash.com/photo-1609592424368-e6922d56c4d7?w=100&q=80' }
      ],
      timeline: [
        { id: 't51', title: 'Delivered to Customer', description: 'Signed and accepted by Hamza Ali.', date: '2026-09-04T18:40:00Z', type: 'delivered' }
      ]
    },
    {
      id: '6',
      orderNumber: 'ORD-9837',
      customerName: 'Sara Sheikh',
      customerEmail: 'sara.s@example.com',
      customerPhone: '+92 301 9988776',
      date: '2026-09-03',
      subtotal: 45.00,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 45.00,
      paymentStatus: 'Refunded',
      fulfillmentStatus: 'Cancelled',
      paymentMethod: 'JazzCash',
      shippingAddress: 'Clifton Block 2',
      city: 'Karachi',
      country: 'Pakistan',
      postalCode: '75600',
      notes: 'Customer requested cancellation due to duplicate purchase.',
      itemsCount: 1,
      items: [
        { productName: 'Belkin 3-in-1 Braided Cable', sku: 'BLK-CAB-3IN1', quantity: 1, unitPrice: 45.00, totalPrice: 45.00, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80' }
      ],
      timeline: [
        { id: 't61', title: 'Order Cancelled & Refunded', description: 'Full refund of $45.00 processed back to JazzCash wallet.', date: '2026-09-03T16:20:00Z', type: 'cancelled' },
        { id: 't62', title: 'Order Placed', description: 'Order created online.', date: '2026-09-03T15:10:00Z', type: 'placed' }
      ]
    },
    {
      id: '7',
      orderNumber: 'ORD-9836',
      customerName: 'Usman Ghani',
      customerEmail: 'usman.ghani@example.com',
      customerPhone: '+92 334 1122334',
      date: '2026-09-03',
      total: 215.50,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Shipped',
      paymentMethod: 'Credit Card',
      shippingAddress: 'Bahria Town Phase 7, Rawalpindi',
      itemsCount: 2,
      items: [
        { productName: 'Razer DeathAdder V3 Pro Wireless', sku: 'RZR-DA-V3', quantity: 1, unitPrice: 149.99, totalPrice: 149.99 },
        { productName: 'SteelSeries QcK Heavy XXL Mousepad', sku: 'STL-QCK-XXL', quantity: 1, unitPrice: 65.51, totalPrice: 65.51 }
      ]
    },
    {
      id: '8',
      orderNumber: 'ORD-9835',
      customerName: 'Ayesha Siddiqui',
      customerEmail: 'ayesha.s@example.com',
      customerPhone: '+92 313 7788990',
      date: '2026-09-03',
      total: 750.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'Hayatabad Phase 4, Peshawar',
      itemsCount: 1,
      items: [
        { productName: 'iPad Mini 6 256GB Wi-Fi Starlight', sku: 'APP-IPD-MINI', quantity: 1, unitPrice: 750.00, totalPrice: 750.00 }
      ]
    },
    {
      id: '9',
      orderNumber: 'ORD-9834',
      customerName: 'Omer Farooq',
      customerEmail: 'omer.f@example.com',
      customerPhone: '+92 322 3344556',
      date: '2026-09-02',
      total: 110.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Easypaisa',
      shippingAddress: 'Satellite Town, Gujranwala',
      itemsCount: 2,
      items: [
        { productName: 'Xiaomi Smart Band 8 Pro', sku: 'MI-BND-8P', quantity: 1, unitPrice: 75.00, totalPrice: 75.00 },
        { productName: 'Replacement Silicone Straps (3-Pack)', sku: 'MI-BND-STR', quantity: 1, unitPrice: 35.00, totalPrice: 35.00 }
      ]
    },
    {
      id: '10',
      orderNumber: 'ORD-9833',
      customerName: 'Hina Javed',
      customerEmail: 'hina.javed@example.com',
      customerPhone: '+92 302 6655443',
      date: '2026-09-02',
      total: 280.00,
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Processing',
      paymentMethod: 'Cash on Delivery (COD)',
      shippingAddress: 'Cantt Area, Sialkot',
      itemsCount: 1,
      items: [
        { productName: 'Shure MV7 USB Podcast Microphone', sku: 'SHU-MV7-BLK', quantity: 1, unitPrice: 280.00, totalPrice: 280.00 }
      ]
    },
    {
      id: '11',
      orderNumber: 'ORD-9832',
      customerName: 'Daniyal Mirza',
      customerEmail: 'daniyal.m@example.com',
      customerPhone: '+92 344 8877665',
      date: '2026-09-01',
      total: 62.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'Wapda Town, Multan',
      itemsCount: 1,
      items: [
        { productName: 'Baseus 100W 20000mAh Power Bank', sku: 'BAS-PB-100W', quantity: 1, unitPrice: 62.00, totalPrice: 62.00 }
      ]
    },
    {
      id: '12',
      orderNumber: 'ORD-9831',
      customerName: 'Khadija Rehman',
      customerEmail: 'khadija.r@example.com',
      customerPhone: '+92 300 4455667',
      date: '2026-09-01',
      total: 310.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Shipped',
      paymentMethod: 'JazzCash',
      shippingAddress: 'University Town, Peshawar',
      itemsCount: 2,
      items: [
        { productName: 'Bose SoundLink Flex Bluetooth Speaker', sku: 'BOS-SL-FLX', quantity: 1, unitPrice: 150.00, totalPrice: 150.00 },
        { productName: 'Kindle Paperwhite 16GB 6.8"', sku: 'AMZ-KND-PW', quantity: 1, unitPrice: 160.00, totalPrice: 160.00 }
      ]
    }
  ]);

  // Products Mock Data (Diverse categories, statuses: Active, Draft, Low Stock, Out of Stock)
  readonly products = signal<AdminProduct[]>([
    {
      id: 'p1',
      sku: 'SON-XM5-BLK',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'Audio',
      price: 299.99,
      compareAtPrice: 349.99,
      costPerItem: 175.00,
      chargeTax: true,
      stock: 45,
      lowStockThreshold: 8,
      trackInventory: true,
      continueSellingWhenOutOfStock: false,
      status: 'Active',
      salesCount: 230,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      description: 'Experience industry-leading noise cancellation with two processors and 8 microphones. Enjoy up to 30 hours of battery life, ultra-comfortable lightweight design, and crystal-clear hands-free calling with precise voice pickup technology.',
      tags: ['Wireless', 'Noise Canceling', 'Premium Audio', 'Bluetooth 5.2', 'Over-Ear'],
      images: [
        { id: 'm1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', isPrimary: true, altText: 'Sony WH-1000XM5 Black Front View' },
        { id: 'm2', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', isPrimary: false, altText: 'Sony WH-1000XM5 Side Angle' },
        { id: 'm3', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', isPrimary: false, altText: 'Sony WH-1000XM5 Lifestyle Desk' },
      ],
      hasVariants: true,
      variantOptions: [
        { name: 'Color', values: ['Midnight Black', 'Platinum Silver', 'Smoky Navy'] },
      ],
      variants: [
        { id: 'v1', combination: 'Midnight Black', sku: 'SON-XM5-BLK', price: 299.99, stock: 25 },
        { id: 'v2', combination: 'Platinum Silver', sku: 'SON-XM5-SLV', price: 299.99, stock: 15 },
        { id: 'v3', combination: 'Smoky Navy', sku: 'SON-XM5-NVY', price: 319.99, stock: 5 },
      ],
      weight: 0.25,
      weightUnit: 'kg',
      dimensions: { length: 22, width: 18, height: 7, unit: 'cm' },
      seo: {
        title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones | GadgetPlanet',
        description: 'Shop the Sony WH-1000XM5 Wireless Headphones with industry-leading active noise cancellation, 30hr battery life, and high-res audio on GadgetPlanet.',
        slug: 'sony-wh-1000xm5-wireless-headphones',
      },
    },
    { id: 'p2', sku: 'ANK-65W-WHT', name: 'Anker 65W GaN Fast Charger', category: 'Accessories', price: 49.99, stock: 120, status: 'Active', salesCount: 540, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80' },
    { id: 'p3', sku: 'LOG-MX3S-GRY', name: 'Logitech MX Master 3S Wireless Mouse', category: 'Peripherals', price: 129.50, stock: 18, status: 'Active', salesCount: 312, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&q=80' },
    { id: 'p4', sku: 'KEY-Q1P-RGB', name: 'Keychron Q1 Pro Wireless Mechanical Keyboard', category: 'Peripherals', price: 199.00, stock: 4, status: 'Low Stock', salesCount: 145, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80' },
    { id: 'p5', sku: 'BNQ-SCR-PRO', name: 'BenQ ScreenBar Pro Monitor Light', category: 'Workspace', price: 139.99, stock: 2, status: 'Low Stock', salesCount: 89, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80' },
    { id: 'p6', sku: 'CAL-TS4-SIL', name: 'CalDigit TS4 Thunderbolt 4 Dock', category: 'Docks & Hubs', price: 249.99, stock: 0, status: 'Out of Stock', salesCount: 78, imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=100&q=80' },
    { id: 'p7', sku: 'APP-MAG-BAT', name: 'Apple MagSafe Battery Pack 5000mAh', category: 'Accessories', price: 89.99, stock: 34, status: 'Active', salesCount: 420, imageUrl: 'https://images.unsplash.com/photo-1609592424368-e6922d56c4d7?w=100&q=80' },
    { id: 'p8', sku: 'DJI-MIC-2', name: 'DJI Mic 2 Wireless Microphone System', category: 'Audio', price: 349.00, stock: 12, status: 'Active', salesCount: 65, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&q=80' },
    { id: 'p9', sku: 'RZR-DA-V3', name: 'Razer DeathAdder V3 Pro Ultra-Lightweight', category: 'Peripherals', price: 149.99, stock: 22, status: 'Active', salesCount: 198, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=100&q=80' },
    { id: 'p10', sku: 'BOS-SL-FLX', name: 'Bose SoundLink Flex Bluetooth Speaker', category: 'Audio', price: 149.00, stock: 15, status: 'Active', salesCount: 172, imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=100&q=80' },
    { id: 'p11', sku: 'BAS-PB-100W', name: 'Baseus Blade 100W Ultra-Thin Power Bank', category: 'Accessories', price: 62.00, stock: 0, status: 'Out of Stock', salesCount: 310, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80' },
    { id: 'p12', sku: 'HYP-CLD-3', name: 'HyperX Cloud III Wireless Gaming Headset', category: 'Audio', price: 169.99, stock: 3, status: 'Low Stock', salesCount: 94, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80' },
    { id: 'p13', sku: 'SND-SD-512', name: 'SanDisk 512GB Extreme PRO UHS-II SDXC', category: 'Accessories', price: 119.00, stock: 50, status: 'Active', salesCount: 150, imageUrl: 'https://images.unsplash.com/photo-1609592424368-e6922d56c4d7?w=100&q=80' },
    { id: 'p14', sku: 'KEY-K3P-RGB', name: 'Keychron K3 Pro Ultra-Slim Mechanical', category: 'Peripherals', price: 110.00, stock: 0, status: 'Draft', salesCount: 0, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80' },
    { id: 'p15', sku: 'ELG-STR-MK2', name: 'Elgato Stream Deck MK.2 15 LCD Keys', category: 'Workspace', price: 149.99, stock: 14, status: 'Active', salesCount: 88, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80' },
    { id: 'p16', sku: 'ANK-MAG-GO', name: 'Anker MagGo Wireless Qi2 Charging Station', category: 'Accessories', price: 99.99, stock: 0, status: 'Draft', salesCount: 0, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&q=80' }
  ]);

  getOrderById(id: string): AdminOrder | undefined {
    return this.orders().find(o => o.id === id);
  }

  getProductById(id: string): AdminProduct | undefined {
    return this.products().find(p => p.id === id);
  }

  updateOrderStatus(orderId: string, status: AdminOrder['fulfillmentStatus'], note?: string): void {
    this.orders.update(list =>
      list.map(ord => {
        if (ord.id !== orderId) return ord;

        let eventType: AdminOrderTimelineEvent['type'] = 'processing';
        if (status === 'Delivered') eventType = 'delivered';
        else if (status === 'Shipped') eventType = 'shipped';
        else if (status === 'Cancelled') eventType = 'cancelled';
        else if (status === 'Pending') eventType = 'placed';

        const newEvent: AdminOrderTimelineEvent = {
          id: `t-${Date.now()}`,
          title: `Order Status: ${status}`,
          description: note || `Fulfillment status updated to ${status} by admin.`,
          date: new Date().toISOString(),
          type: eventType,
        };

        const timeline = ord.timeline ? [newEvent, ...ord.timeline] : [newEvent];

        return {
          ...ord,
          fulfillmentStatus: status,
          timeline,
        };
      })
    );
  }

  updateOrderNotes(orderId: string, notes: string): void {
    this.orders.update(list =>
      list.map(ord => {
        if (ord.id !== orderId) return ord;

        const newEvent: AdminOrderTimelineEvent = {
          id: `t-${Date.now()}`,
          title: 'Internal Note Added',
          description: notes,
          date: new Date().toISOString(),
          type: 'note',
        };

        const timeline = ord.timeline ? [newEvent, ...ord.timeline] : [newEvent];

        return {
          ...ord,
          notes,
          timeline,
        };
      })
    );
  }

  addOrderTimelineEvent(orderId: string, event: Omit<AdminOrderTimelineEvent, 'id'>): void {
    this.orders.update(list =>
      list.map(ord => {
        if (ord.id !== orderId) return ord;
        const newEvent: AdminOrderTimelineEvent = {
          ...event,
          id: `t-${Date.now()}`,
        };
        return {
          ...ord,
          timeline: [newEvent, ...(ord.timeline || [])],
        };
      })
    );
  }

  deleteOrder(orderId: string): void {
    this.orders.update(list => list.filter(ord => ord.id !== orderId));
  }

  deleteMultipleOrders(orderIds: string[]): void {
    const idSet = new Set(orderIds);
    this.orders.update(list => list.filter(ord => !idSet.has(ord.id)));
  }

  addProduct(product: Omit<AdminProduct, 'id' | 'salesCount'>): void {
    const newProd: AdminProduct = {
      ...product,
      id: `p-${Date.now()}`,
      salesCount: 0
    };
    this.products.update(list => [newProd, ...list]);
  }

  updateProduct(id: string, updates: Partial<AdminProduct>): void {
    this.products.update(list =>
      list.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  duplicateProduct(id: string): AdminProduct | undefined {
    const original = this.products().find(p => p.id === id);
    if (!original) return undefined;

    const copy: AdminProduct = {
      ...original,
      id: `p-${Date.now()}`,
      sku: `${original.sku}-COPY`,
      name: `${original.name} (Copy)`,
      salesCount: 0,
      status: 'Draft'
    };

    this.products.update(list => [copy, ...list]);
    return copy;
  }

  deleteProduct(id: string): void {
    this.products.update(list => list.filter(p => p.id !== id));
  }

  deleteMultipleProducts(ids: string[]): void {
    const idSet = new Set(ids);
    this.products.update(list => list.filter(p => !idSet.has(p.id)));
  }

  updateMultipleProductStatus(ids: string[], status: AdminProduct['status']): void {
    const idSet = new Set(ids);
    this.products.update(list =>
      list.map(p => (idSet.has(p.id) ? { ...p, status } : p))
    );
  }

  restockProduct(productId: string, amount: number = 10): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id !== productId) return p;
        const newStock = p.stock + amount;
        return {
          ...p,
          stock: newStock,
          status: newStock > 0 && p.status === 'Out of Stock' ? 'Active' : p.status
        };
      })
    );
  }

  // Customers Mock Data (12+ realistic customer profiles)
  readonly customers = signal<AdminCustomer[]>([
    {
      id: 'c1',
      name: 'Ahmad Khan',
      email: 'ahmad.khan@example.com',
      phone: '+92 300 1234567',
      joinedDate: '2025-11-12',
      status: 'VIP',
      totalOrders: 5,
      totalSpent: 1420.50,
      tags: ['VIP', 'Audio Enthusiast', 'High Value'],
      notes: 'Prefers TCS delivery, leave package at front desk with security guard.',
      addresses: [
        { id: 'a1', isDefault: true, label: 'Home', recipientName: 'Ahmad Khan', street: 'House 45, Street 12, F-8/2', city: 'Islamabad', country: 'Pakistan', postalCode: '44000', phone: '+92 300 1234567' },
        { id: 'a2', isDefault: false, label: 'Office', recipientName: 'Ahmad Khan (Work)', street: 'Software Tech Park, Sector I-9/3', city: 'Islamabad', country: 'Pakistan', postalCode: '44000', phone: '+92 300 1234567' }
      ]
    },
    {
      id: 'c2',
      name: 'Fatima Zahra',
      email: 'f.zahra@example.com',
      phone: '+92 321 7654321',
      joinedDate: '2026-02-14',
      status: 'Active',
      totalOrders: 3,
      totalSpent: 489.00,
      tags: ['Peripherals', 'Repeat Buyer'],
      notes: 'Requested weekend-only deliveries.',
      addresses: [
        { id: 'a3', isDefault: true, label: 'Home', recipientName: 'Fatima Zahra', street: 'Apartment 3B, DHA Phase 5', city: 'Lahore', country: 'Pakistan', postalCode: '54792', phone: '+92 321 7654321' }
      ]
    },
    {
      id: 'c3',
      name: 'Bilal Tariq',
      email: 'bilal.tariq@example.com',
      phone: '+92 333 9876543',
      joinedDate: '2025-08-20',
      status: 'VIP',
      totalOrders: 6,
      totalSpent: 2150.00,
      tags: ['VIP', 'Mechanical Keyboards', 'Workspace Pro'],
      notes: 'Frequently orders premium Keychron accessories and docks.',
      addresses: [
        { id: 'a4', isDefault: true, label: 'Office', recipientName: 'Bilal Tariq', street: 'Plot 108, Block C, Gulshan-e-Iqbal', city: 'Karachi', country: 'Pakistan', postalCode: '75300', phone: '+92 333 9876543' }
      ]
    },
    {
      id: 'c4',
      name: 'Zainab Bibi',
      email: 'zainab.b@example.com',
      phone: '+92 345 5551234',
      joinedDate: '2026-05-10',
      status: 'Active',
      totalOrders: 2,
      totalSpent: 210.00,
      tags: ['Mobile Accessories'],
      addresses: [
        { id: 'a5', isDefault: true, label: 'Home', recipientName: 'Zainab Bibi', street: 'Street 4, Sector G-11/3', city: 'Islamabad', country: 'Pakistan', postalCode: '44000', phone: '+92 345 5551234' }
      ]
    },
    {
      id: 'c5',
      name: 'Hamza Ali',
      email: 'hamza.ali@example.com',
      phone: '+92 312 4443322',
      joinedDate: '2026-01-25',
      status: 'Active',
      totalOrders: 4,
      totalSpent: 980.00,
      tags: ['Content Creator', 'Photography'],
      addresses: [
        { id: 'a6', isDefault: true, label: 'Studio', recipientName: 'Hamza Ali Studios', street: 'Model Town, Block B', city: 'Lahore', country: 'Pakistan', postalCode: '54700', phone: '+92 312 4443322' }
      ]
    },
    {
      id: 'c6',
      name: 'Sara Sheikh',
      email: 'sara.s@example.com',
      phone: '+92 301 9988776',
      joinedDate: '2026-03-01',
      status: 'Inactive',
      totalOrders: 1,
      totalSpent: 45.00,
      tags: ['Cables'],
      notes: 'One returned/cancelled order.',
      addresses: [
        { id: 'a7', isDefault: true, label: 'Home', recipientName: 'Sara Sheikh', street: 'Clifton Block 2', city: 'Karachi', country: 'Pakistan', postalCode: '75600', phone: '+92 301 9988776' }
      ]
    },
    {
      id: 'c7',
      name: 'Usman Ghani',
      email: 'usman.ghani@example.com',
      phone: '+92 334 1122334',
      joinedDate: '2026-04-18',
      status: 'Active',
      totalOrders: 3,
      totalSpent: 620.00,
      tags: ['Gaming', 'Razer Fan'],
      addresses: [
        { id: 'a8', isDefault: true, label: 'Home', recipientName: 'Usman Ghani', street: 'Bahria Town Phase 7', city: 'Rawalpindi', country: 'Pakistan', postalCode: '46000', phone: '+92 334 1122334' }
      ]
    },
    {
      id: 'c8',
      name: 'Ayesha Siddiqui',
      email: 'ayesha.s@example.com',
      phone: '+92 313 7788990',
      joinedDate: '2025-06-15',
      status: 'VIP',
      totalOrders: 8,
      totalSpent: 3450.00,
      tags: ['VIP', 'Tablet Accessories', 'Apple Ecosystem'],
      notes: 'Consistently buys flagship accessories.',
      addresses: [
        { id: 'a9', isDefault: true, label: 'Home', recipientName: 'Ayesha Siddiqui', street: 'Hayatabad Phase 4', city: 'Peshawar', country: 'Pakistan', postalCode: '25000', phone: '+92 313 7788990' }
      ]
    },
    {
      id: 'c9',
      name: 'Omer Farooq',
      email: 'omer.f@example.com',
      phone: '+92 322 3344556',
      joinedDate: '2026-06-22',
      status: 'Active',
      totalOrders: 2,
      totalSpent: 185.00,
      tags: ['Wearables'],
      addresses: [
        { id: 'a10', isDefault: true, label: 'Home', recipientName: 'Omer Farooq', street: 'Satellite Town', city: 'Gujranwala', country: 'Pakistan', postalCode: '52250', phone: '+92 322 3344556' }
      ]
    },
    {
      id: 'c10',
      name: 'Hina Javed',
      email: 'hina.javed@example.com',
      phone: '+92 302 6655443',
      joinedDate: '2026-08-30',
      status: 'New',
      totalOrders: 1,
      totalSpent: 280.00,
      tags: ['Podcasting', 'First Time Buyer'],
      addresses: [
        { id: 'a11', isDefault: true, label: 'Home', recipientName: 'Hina Javed', street: 'Cantt Area', city: 'Sialkot', country: 'Pakistan', postalCode: '51310', phone: '+92 302 6655443' }
      ]
    },
    {
      id: 'c11',
      name: 'Daniyal Mirza',
      email: 'daniyal.m@example.com',
      phone: '+92 344 8877665',
      joinedDate: '2026-09-01',
      status: 'New',
      totalOrders: 1,
      totalSpent: 62.00,
      tags: ['Power Banks'],
      addresses: [
        { id: 'a12', isDefault: true, label: 'Home', recipientName: 'Daniyal Mirza', street: 'Wapda Town', city: 'Multan', country: 'Pakistan', postalCode: '60000', phone: '+92 344 8877665' }
      ]
    },
    {
      id: 'c12',
      name: 'Khadija Rehman',
      email: 'khadija.r@example.com',
      phone: '+92 300 4455667',
      joinedDate: '2026-07-08',
      status: 'Active',
      totalOrders: 2,
      totalSpent: 460.00,
      tags: ['Audio', 'E-readers'],
      addresses: [
        { id: 'a13', isDefault: true, label: 'Home', recipientName: 'Khadija Rehman', street: 'University Town', city: 'Peshawar', country: 'Pakistan', postalCode: '25000', phone: '+92 300 4455667' }
      ]
    }
  ]);

  // Customer Query & Mutation Methods
  getCustomerById(id: string): AdminCustomer | undefined {
    return this.customers().find(c => c.id === id);
  }

  getCustomerOrders(customerEmail: string): AdminOrder[] {
    const normalized = customerEmail.toLowerCase().trim();
    return this.orders().filter(o => o.customerEmail.toLowerCase().trim() === normalized);
  }

  addCustomer(customer: Omit<AdminCustomer, 'id' | 'totalOrders' | 'totalSpent'>): void {
    const newCust: AdminCustomer = {
      ...customer,
      id: `c-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0
    };
    this.customers.update(list => [newCust, ...list]);
  }

  updateCustomer(id: string, updates: Partial<AdminCustomer>): void {
    this.customers.update(list =>
      list.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }

  deleteCustomer(id: string): void {
    this.customers.update(list => list.filter(c => c.id !== id));
  }

  deleteMultipleCustomers(ids: string[]): void {
    const idSet = new Set(ids);
    this.customers.update(list => list.filter(c => !idSet.has(c.id)));
  }

  addCustomerTag(customerId: string, tag: string): void {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    this.customers.update(list =>
      list.map(c => {
        if (c.id !== customerId) return c;
        if (c.tags.includes(cleanTag)) return c;
        return { ...c, tags: [...c.tags, cleanTag] };
      })
    );
  }

  removeCustomerTag(customerId: string, tag: string): void {
    this.customers.update(list =>
      list.map(c => {
        if (c.id !== customerId) return c;
        return { ...c, tags: c.tags.filter(t => t !== tag) };
      })
    );
  }

  addCustomerAddress(customerId: string, address: Omit<CustomerAddress, 'id'>): void {
    const newAddress: CustomerAddress = {
      ...address,
      id: `addr-${Date.now()}`
    };
    this.customers.update(list =>
      list.map(c => {
        if (c.id !== customerId) return c;
        const updatedAddresses = address.isDefault
          ? c.addresses.map(a => ({ ...a, isDefault: false }))
          : [...c.addresses];
        return { ...c, addresses: [...updatedAddresses, newAddress] };
      })
    );
  }
}
