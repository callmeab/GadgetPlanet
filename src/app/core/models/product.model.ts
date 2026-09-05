// ============================================================
// GadgetPlanet — Core Domain Models
// ============================================================

export type BadgeTag = 'Bestseller' | 'New' | 'Hot Deal' | 'Limited' | 'Sale' | 'Top Rated';

export type ProductCategory =
  | 'Earphones'
  | 'Speakers'
  | 'Smartwatches'
  | 'Headphones'
  | 'Gaming'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  images: string[];
  rating: number;        // 0.0 – 5.0
  reviewCount: number;
  badges: BadgeTag[];
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
  stockCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

// Utility
export function calcDiscountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}
