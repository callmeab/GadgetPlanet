import { Injectable, signal } from '@angular/core';

export interface AdminKpiMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  badgeText?: string;
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
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  fulfillmentStatus: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  itemsCount: number;
  items: AdminOrderItem[];
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  salesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminMockDataService {
  // KPI Metrics
  readonly metrics = signal<AdminKpiMetric[]>([
    {
      id: 'rev',
      title: 'Total Revenue',
      value: '$148,290.00',
      change: 14.6,
      changeLabel: 'vs last 30 days',
      badgeText: 'Live'
    },
    {
      id: 'ord',
      title: 'Total Orders',
      value: '1,842',
      change: 8.3,
      changeLabel: 'vs last 30 days',
      badgeText: '30d'
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: '$80.50',
      change: -1.8,
      changeLabel: 'vs last 30 days',
      badgeText: '30d'
    },
    {
      id: 'cus',
      title: 'Active Customers',
      value: '4,120',
      change: 24.1,
      changeLabel: 'vs last 30 days',
      badgeText: 'Live'
    }
  ]);

  // Orders Mock Data (20+ realistic orders)
  readonly orders = signal<AdminOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-9842',
      customerName: 'Ahmad Khan',
      customerEmail: 'ahmad.khan@example.com',
      customerPhone: '+92 300 1234567',
      date: '2026-09-05',
      total: 349.99,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'House 45, Street 12, F-8/2, Islamabad',
      itemsCount: 2,
      items: [
        { productName: 'Sony WH-1000XM5 Wireless Headphones', sku: 'SON-XM5-BLK', quantity: 1, unitPrice: 299.99, totalPrice: 299.99 },
        { productName: 'Anker 65W GaN Fast Charger', sku: 'ANK-65W-WHT', quantity: 1, unitPrice: 50.00, totalPrice: 50.00 }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-9841',
      customerName: 'Fatima Zahra',
      customerEmail: 'f.zahra@example.com',
      customerPhone: '+92 321 7654321',
      date: '2026-09-05',
      total: 129.50,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Processing',
      paymentMethod: 'JazzCash',
      shippingAddress: 'Apartment 3B, DHA Phase 5, Lahore',
      itemsCount: 1,
      items: [
        { productName: 'Logitech MX Master 3S Wireless Mouse', sku: 'LOG-MX3S-GRY', quantity: 1, unitPrice: 129.50, totalPrice: 129.50 }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-9840',
      customerName: 'Bilal Tariq',
      customerEmail: 'bilal.tariq@example.com',
      customerPhone: '+92 333 9876543',
      date: '2026-09-04',
      total: 589.00,
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Processing',
      paymentMethod: 'Cash on Delivery (COD)',
      shippingAddress: 'Plot 108, Block C, Gulshan-e-Iqbal, Karachi',
      itemsCount: 3,
      items: [
        { productName: 'Keychron Q1 Pro Wireless Mechanical Keyboard', sku: 'KEY-Q1P-RGB', quantity: 1, unitPrice: 199.00, totalPrice: 199.00 },
        { productName: 'BenQ ScreenBar Pro Monitor Light', sku: 'BNQ-SCR-PRO', quantity: 1, unitPrice: 140.00, totalPrice: 140.00 },
        { productName: 'CalDigit TS4 Thunderbolt 4 Dock', sku: 'CAL-TS4-SIL', quantity: 1, unitPrice: 250.00, totalPrice: 250.00 }
      ]
    },
    {
      id: '4',
      orderNumber: 'ORD-9839',
      customerName: 'Zainab Bibi',
      customerEmail: 'zainab.b@example.com',
      customerPhone: '+92 345 5551234',
      date: '2026-09-04',
      total: 89.99,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Shipped',
      paymentMethod: 'Easypaisa',
      shippingAddress: 'Street 4, Sector G-11/3, Islamabad',
      itemsCount: 1,
      items: [
        { productName: 'Apple MagSafe Battery Pack', sku: 'APP-MAG-BAT', quantity: 1, unitPrice: 89.99, totalPrice: 89.99 }
      ]
    },
    {
      id: '5',
      orderNumber: 'ORD-9838',
      customerName: 'Hamza Ali',
      customerEmail: 'hamza.ali@example.com',
      customerPhone: '+92 312 4443322',
      date: '2026-09-04',
      total: 420.00,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      shippingAddress: 'Model Town, Block B, Lahore',
      itemsCount: 2,
      items: [
        { productName: 'DJI Mic 2 Wireless Microphone System', sku: 'DJI-MIC-2', quantity: 1, unitPrice: 349.00, totalPrice: 349.00 },
        { productName: 'SanDisk 256GB Extreme PRO UHS-II SDXC', sku: 'SND-SD-256', quantity: 1, unitPrice: 71.00, totalPrice: 71.00 }
      ]
    },
    {
      id: '6',
      orderNumber: 'ORD-9837',
      customerName: 'Sara Sheikh',
      customerEmail: 'sara.s@example.com',
      customerPhone: '+92 301 9988776',
      date: '2026-09-03',
      total: 45.00,
      paymentStatus: 'Refunded',
      fulfillmentStatus: 'Cancelled',
      paymentMethod: 'JazzCash',
      shippingAddress: 'Clifton Block 2, Karachi',
      itemsCount: 1,
      items: [
        { productName: 'Belkin 3-in-1 Braided Charging Cable', sku: 'BLK-CAB-3IN1', quantity: 1, unitPrice: 45.00, totalPrice: 45.00 }
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

  // Products Mock Data
  readonly products = signal<AdminProduct[]>([
    { id: 'p1', sku: 'SON-XM5-BLK', name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Audio', price: 299.99, stock: 45, status: 'In Stock', salesCount: 230 },
    { id: 'p2', sku: 'ANK-65W-WHT', name: 'Anker 65W GaN Fast Charger', category: 'Accessories', price: 50.00, stock: 120, status: 'In Stock', salesCount: 540 },
    { id: 'p3', sku: 'LOG-MX3S-GRY', name: 'Logitech MX Master 3S Wireless Mouse', category: 'Peripherals', price: 129.50, stock: 18, status: 'In Stock', salesCount: 312 },
    { id: 'p4', sku: 'KEY-Q1P-RGB', name: 'Keychron Q1 Pro Wireless Mechanical Keyboard', category: 'Peripherals', price: 199.00, stock: 6, status: 'Low Stock', salesCount: 145 },
    { id: 'p5', sku: 'BNQ-SCR-PRO', name: 'BenQ ScreenBar Pro Monitor Light', category: 'Workspace', price: 140.00, stock: 2, status: 'Low Stock', salesCount: 89 },
    { id: 'p6', sku: 'CAL-TS4-SIL', name: 'CalDigit TS4 Thunderbolt 4 Dock', category: 'Docks & Hubs', price: 250.00, stock: 0, status: 'Out of Stock', salesCount: 78 },
    { id: 'p7', sku: 'APP-MAG-BAT', name: 'Apple MagSafe Battery Pack', category: 'Accessories', price: 89.99, stock: 34, status: 'In Stock', salesCount: 420 },
    { id: 'p8', sku: 'DJI-MIC-2', name: 'DJI Mic 2 Wireless Microphone System', category: 'Audio & Video', price: 349.00, stock: 12, status: 'In Stock', salesCount: 65 }
  ]);

  getOrderById(id: string): AdminOrder | undefined {
    return this.orders().find(o => o.id === id);
  }

  updateOrderStatus(orderId: string, status: AdminOrder['fulfillmentStatus']): void {
    this.orders.update(list =>
      list.map(ord => (ord.id === orderId ? { ...ord, fulfillmentStatus: status } : ord))
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
}
