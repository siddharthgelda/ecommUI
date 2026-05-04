// src/app/features/products/components/product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router }       from '@angular/router';
import { Subject }                      from 'rxjs';
import { takeUntil }                    from 'rxjs/operators';
import { ProductService }               from '../../../core/services/product.service';
import { CartService }                  from '../../../core/services/cart.service';
import { Product }                      from '../../../core/models';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
   imports: [
      CommonModule   // ✅ gives number, date, ngIf, ngFor
    ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  product:            Product | null = null;
  loading             = true;
  quantity            = 1;
  selectedImageIndex  = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private productService: ProductService,
    private cartService:    CartService,
  ) {}

  ngOnInit(): void {
    // NULL CHECK 1 — route param 'id' may be null
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.router.navigate(['/products']);
      return;
    }

    this.productService.getProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: p => {
          // NULL CHECK 2 — API may return null body
          this.product = p ?? null;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          // Stay on page to show error state in template
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────────────────────
  // User Actions
  // ─────────────────────────────────────────────────────────────

  changeQty(delta: number): void {
    this.quantity = Math.max(
      1,
      Math.min(this.quantity + delta, this.maxQuantity),
    );
  }

  selectImage(index: number): void {
    // NULL CHECK 3 — imageUrls array bounds check
    const images = this.product?.imageUrls;
    if (images && index >= 0 && index < images.length) {
      this.selectedImageIndex = index;
    }
  }

  addToCart(): void {
    // NULL CHECK 4 — product and canAddToCart before calling cart
    if (!this.product || !this.canAddToCart) return;
    this.cartService.addItem(this.product, this.quantity);
    this.router.navigate(['/cart']);
  }

  buyNow(): void {
    // NULL CHECK 5 — same guard as addToCart
    if (!this.product || !this.canAddToCart) return;
    this.cartService.addItem(this.product, this.quantity);
    this.router.navigate(['/checkout']);
  }

  // ─────────────────────────────────────────────────────────────
  // Computed getters — all null-safe
  // ─────────────────────────────────────────────────────────────

  /**
   * Effective selling price.
   * NULL CHECK: price AND discountedPrice may both be null.
   * Fallback chain: discountedPrice → price → 0
   */
  get effectivePrice(): number {
    if (this.product == null) return 0;

    const { price, discountedPrice } = this.product;

    if (
      discountedPrice != null &&
      discountedPrice > 0 &&
      price != null &&
      discountedPrice < price
    ) {
      return discountedPrice;
    }
    return price ?? 0;
  }

  /**
   * True only when a genuine discount exists.
   * NULL CHECK: all three fields — price, discountedPrice, discountPercent — required.
   */
  get hasDiscount(): boolean {
    const { price, discountedPrice, discountPercent } = this.product ?? {};
    return (
      price          != null &&
      discountedPrice != null &&
      discountPercent != null &&
      discountPercent  > 0   &&
      discountedPrice  < price
    );
  }

  /**
   * First (primary) image URL.
   * NULL CHECK: imageUrls may be null, undefined, or empty array.
   */
  get primaryImageUrl(): string | null {
    const urls = this.product?.imageUrls;
    if (!Array.isArray(urls) || urls.length === 0) return null;
    return urls[this.selectedImageIndex] ?? urls[0] ?? null;
  }

  /**
   * Show thumbnails only when 2+ images exist.
   */
  get hasMultipleImages(): boolean {
    return (this.product?.imageUrls?.length ?? 0) > 1;
  }

  /**
   * Category name.
   * NULL CHECK: product → category → name chain may break at any step.
   */
  get categoryName(): string {
    return this.product?.category?.name ?? 'Product';
  }

  /**
   * Category emoji fallback.
   */
  get categoryEmoji(): string {
    const map: Record<string, string> = {
      'Electronics':   '📱',
      'Footwear':      '👟',
      'Apparel':       '👕',
      'Home & Living': '🏠',
      'Sports':        '⚽',
    };
    return map[this.categoryName] ?? '📦';
  }

  /**
   * Star rating display string.
   * NULL CHECK: averageRating may be null, undefined, or NaN.
   * Returns 5 empty stars when rating unavailable.
   */
  get starDisplay(): string {
    const r = this.product?.averageRating;
    if (r == null || isNaN(r) || r < 0) return '☆☆☆☆☆';
    const full = Math.min(5, Math.max(0, Math.round(r)));
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  /**
   * True when rating is a valid positive number.
   * NULL CHECK: 0, null, undefined, and NaN all treated as "no rating".
   */
  get hasRating(): boolean {
    const r = this.product?.averageRating;
    return r != null && !isNaN(r) && r > 0;
  }

  /**
   * True when reviewCount is a positive integer.
   * NULL CHECK: null, undefined, and 0 all treated as "no reviews".
   */
  get hasReviews(): boolean {
    const c = this.product?.reviewCount;
    return c != null && c > 0;
  }

  /**
   * Plural suffix for review count label.
   */
  get reviewLabel(): string {
    const c = this.product?.reviewCount ?? 0;
    return c === 1 ? 'review' : 'reviews';
  }

  /**
   * Maximum orderable quantity.
   * NULL CHECK: stockQuantity may be null — caps at 99 as safe default.
   */
  get maxQuantity(): number {
    const stock = this.product?.stockQuantity;
    return stock != null && stock > 0 ? stock : 99;
  }

  /**
   * Low stock warning when 5 or fewer units remain.
   * NULL CHECK: inStock and stockQuantity both checked.
   */
  get isLowStock(): boolean {
    const stock = this.product?.stockQuantity;
    return (
      this.product?.inStock === true &&
      stock != null &&
      stock  > 0    &&
      stock <= 5
    );
  }

  /**
   * Whether the user can add this product to the cart.
   * NULL CHECK: product, inStock, and stockQuantity all required.
   */
  get canAddToCart(): boolean {
    return (
      this.product             != null  &&
      this.product.inStock     === true &&
      (this.product.stockQuantity ?? 0)  > 0
    );
  }

  /**
   * Attribute entries for display.
   * NULL CHECK: attributes may be null, undefined, or not an object.
   * Also filters out any entry where the key is blank.
   */
  get attrEntries(): { key: string; value: any }[] {
    const attrs = this.product?.attributes;

    if (attrs == null || typeof attrs !== 'object' || Array.isArray(attrs)) {
      return [];
    }

    return Object.entries(attrs)
      .filter(([key]) => key != null && key.trim() !== '')
      .map(([key, value]) => ({
        key:   key.trim(),
        // NULL CHECK: individual attribute value may be null/undefined
        value: value ?? '—',
      }));
  }
}
