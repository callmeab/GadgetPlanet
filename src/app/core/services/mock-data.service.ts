// ============================================================
// GadgetPlanet — Mock Data Service
// ============================================================
import { Injectable } from '@angular/core';
import { Product, calcDiscountPercent } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  private readonly products: Product[] = [
    {
      id: 'p001',
      name: 'AirBass Pro X1',
      brand: 'SoundCore',
      category: 'Earphones',
      price: 3999,
      discountPrice: 2499,
      discountPercent: calcDiscountPercent(3999, 2499),
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80',
      ],
      rating: 4.5,
      reviewCount: 2341,
      badges: ['Bestseller'],
      description: 'Deep bass, 30-hour battery, IPX5 water-resistant true wireless earphones.',
      specs: { 'Driver': '13mm Dynamic', 'Battery': '30H (case)', 'Connectivity': 'Bluetooth 5.3', 'Water Resistance': 'IPX5' },
      inStock: true,
      stockCount: 120,
    },
    {
      id: 'p002',
      name: 'QuantumBoom 360',
      brand: 'BoomX',
      category: 'Speakers',
      price: 8999,
      discountPrice: 6499,
      discountPercent: calcDiscountPercent(8999, 6499),
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
      ],
      rating: 4.7,
      reviewCount: 890,
      badges: ['Hot Deal', 'Bestseller'],
      description: '360° surround sound with 20W output and LED mood lighting.',
      specs: { 'Output': '20W RMS', 'Battery': '18H', 'Connectivity': 'Bluetooth 5.2 + AUX', 'IP Rating': 'IPX7' },
      inStock: true,
      stockCount: 45,
    },
    {
      id: 'p003',
      name: 'VortexWatch Ultra',
      brand: 'TechWear',
      category: 'Smartwatches',
      price: 14999,
      discountPrice: 10999,
      discountPercent: calcDiscountPercent(14999, 10999),
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
      ],
      rating: 4.6,
      reviewCount: 3102,
      badges: ['New', 'Bestseller'],
      description: 'AMOLED display, SpO2, GPS, 7-day battery, fitness tracking.',
      specs: { 'Display': '1.78" AMOLED', 'Battery': '7 days', 'GPS': 'Built-in', 'Sensors': 'SpO2, Heart Rate, Stress' },
      inStock: true,
      stockCount: 78,
    },
    {
      id: 'p004',
      name: 'StudioPro 7 Headphones',
      brand: 'AudioVault',
      category: 'Headphones',
      price: 12999,
      discountPrice: 8999,
      discountPercent: calcDiscountPercent(12999, 8999),
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
      ],
      rating: 4.8,
      reviewCount: 5421,
      badges: ['Top Rated'],
      description: 'Active Noise Cancellation, Hi-Res Audio certified, 40H playtime.',
      specs: { 'Driver': '40mm Dynamic', 'ANC': 'Hybrid ANC', 'Battery': '40H ANC on', 'Codec': 'LDAC, AAC, SBC' },
      inStock: true,
      stockCount: 33,
    },
    {
      id: 'p005',
      name: 'NitroX Gaming Headset',
      brand: 'NitroTech',
      category: 'Gaming',
      price: 5999,
      discountPrice: 3999,
      discountPercent: calcDiscountPercent(5999, 3999),
      images: [
        'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
      ],
      rating: 4.3,
      reviewCount: 1876,
      badges: ['Hot Deal'],
      description: '7.1 surround sound, detachable mic, RGB lighting, 50H wireless.',
      specs: { 'Sound': '7.1 Virtual Surround', 'Mic': 'Detachable Noise-cancel', 'Battery': '50H', 'RGB': 'Per-zone RGB' },
      inStock: true,
      stockCount: 61,
    },
    {
      id: 'p006',
      name: 'PocketBass Mini',
      brand: 'BoomX',
      category: 'Speakers',
      price: 2999,
      discountPrice: 1799,
      discountPercent: calcDiscountPercent(2999, 1799),
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
      ],
      rating: 4.1,
      reviewCount: 634,
      badges: ['Sale'],
      description: 'Compact 10W portable speaker with 12H battery and IPX6 rating.',
      specs: { 'Output': '10W', 'Battery': '12H', 'IP Rating': 'IPX6', 'Weight': '280g' },
      inStock: true,
      stockCount: 200,
    },
    {
      id: 'p007',
      name: 'CloudFit ANC Buds',
      brand: 'SoundCore',
      category: 'Earphones',
      price: 6999,
      discountPrice: 4999,
      discountPercent: calcDiscountPercent(6999, 4999),
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      ],
      rating: 4.4,
      reviewCount: 1122,
      badges: ['New'],
      description: 'Dual ANC, transparency mode, 8mm drivers, 36H total battery.',
      specs: { 'Driver': '8mm Dynamic', 'ANC': 'Dual-microphone ANC', 'Battery': '36H total', 'Connectivity': 'Bluetooth 5.3' },
      inStock: true,
      stockCount: 90,
    },
    {
      id: 'p008',
      name: 'SlimFlex Band 3',
      brand: 'TechWear',
      category: 'Smartwatches',
      price: 4499,
      discountPrice: 2999,
      discountPercent: calcDiscountPercent(4499, 2999),
      images: [
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
      ],
      rating: 4.2,
      reviewCount: 455,
      badges: ['Sale'],
      description: 'Slim fitness band with heart rate, SpO2, and 14-day battery.',
      specs: { 'Display': '0.95" AMOLED', 'Battery': '14 days', 'Sensors': 'HR, SpO2', 'Water Resistance': '5ATM' },
      inStock: true,
      stockCount: 150,
    },
    {
      id: 'p009',
      name: 'ZenTune Studio Cans',
      brand: 'AudioVault',
      category: 'Headphones',
      price: 7499,
      discountPrice: null,
      discountPercent: null,
      images: [
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
      ],
      rating: 4.9,
      reviewCount: 312,
      badges: ['Top Rated', 'Limited'],
      description: 'Open-back planar magnetic headphones for audiophile-grade listening.',
      specs: { 'Type': 'Open-back', 'Driver': 'Planar Magnetic', 'Impedance': '300Ω', 'THD': '<0.1%' },
      inStock: true,
      stockCount: 18,
    },
    {
      id: 'p010',
      name: 'ByteStick Ultra USB-C Hub',
      brand: 'ConnectX',
      category: 'Accessories',
      price: 3499,
      discountPrice: 2499,
      discountPercent: calcDiscountPercent(3499, 2499),
      images: [
        'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80',
      ],
      rating: 4.6,
      reviewCount: 789,
      badges: ['Bestseller'],
      description: '10-in-1 USB-C hub: 4K HDMI, 100W PD, SD card, USB 3.2 ports.',
      specs: { 'Ports': '10-in-1', 'HDMI': '4K@60Hz', 'PD': '100W Pass-through', 'USB': 'USB 3.2 Gen2' },
      inStock: true,
      stockCount: 300,
    },
    {
      id: 'p011',
      name: 'ChargePad Trio Wireless',
      brand: 'ConnectX',
      category: 'Accessories',
      price: 2999,
      discountPrice: 1999,
      discountPercent: calcDiscountPercent(2999, 1999),
      images: [
        'https://images.unsplash.com/photo-1609592806596-b9b3acb7c36a?w=600&q=80',
      ],
      rating: 4.3,
      reviewCount: 540,
      badges: ['New', 'Hot Deal'],
      description: '3-in-1 wireless charger for phone, earbuds, and smartwatch simultaneously.',
      specs: { 'Wattage': '15W max', 'Compatibility': 'Qi2 + MagSafe', 'Cable': 'USB-C included', 'Material': 'Vegan leather' },
      inStock: true,
      stockCount: 85,
    },
    {
      id: 'p012',
      name: 'BladeAir Pro Neckband',
      brand: 'SoundCore',
      category: 'Earphones',
      price: 1999,
      discountPrice: 1299,
      discountPercent: calcDiscountPercent(1999, 1299),
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      ],
      rating: 4.0,
      reviewCount: 1234,
      badges: ['Sale', 'Bestseller'],
      description: 'Neckband with magnetic snap buds, 20H battery, fast charge (10min=60min).',
      specs: { 'Battery': '20H', 'Fast Charge': '10min=60min', 'Driver': '9.2mm', 'Connectivity': 'Bluetooth 5.1' },
      inStock: false,
      stockCount: 0,
    },
  ];

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(p => p.category === category);
  }

  getFeaturedProducts(limit = 6): Product[] {
    return this.products
      .filter(p => p.badges.includes('Bestseller') || p.badges.includes('Top Rated'))
      .slice(0, limit);
  }

  getNewArrivals(limit = 6): Product[] {
    return this.products
      .filter(p => p.badges.includes('New'))
      .slice(0, limit);
  }

  getHotDeals(limit = 8): Product[] {
    return this.products
      .filter(p => p.discountPrice !== undefined && p.inStock)
      .slice(0, limit);
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return this.products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
}
