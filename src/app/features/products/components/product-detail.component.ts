// src/app/features/products/components/product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute,
         Router }             from '@angular/router';
import { Subject }            from 'rxjs';
import { takeUntil }          from 'rxjs/operators';
import { ProductService }     from '../../../core/services/product.service';
import { CartService }        from '../../../core/services/cart.service';
import { Product }            from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  template: `
  <div class="container page">
    <div class="loading-wrap" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <ng-container *ngIf="!loading && product">
      <div class="breadcrumb">
        <a routerLink="/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a routerLink="/products">Products</a>
        <span class="breadcrumb-sep">›</span>
        <span>{{ product.name }}</span>
      </div>

      <div class="product-detail-grid">
        <!-- Image -->
        <div class="product-gallery">
          <div class="product-main-img">
            <img *ngIf="product.imageUrls?.[0]"
                 [src]="product.imageUrls[0]" [alt]="product.name"/>
            <span *ngIf="!product.imageUrls?.[0]" style="font-size:80px">
              {{ getEmoji(product.category.name) }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="product-detail-info">
          <div class="product-detail-cat">{{ product.category.name }}</div>
          <h1 class="product-detail-name">{{ product.name }}</h1>

          <div class="product-detail-rating">
            <span class="stars" style="font-size:16px">{{ getStars(product.averageRating) }}</span>
            <strong>{{ product.averageRating | number:'1.1-1' }}</strong>
            <span>({{ product.reviewCount }} reviews)</span>
            <span class="stock-badge"
                  [class.stock-in]="product.inStock"
                  [class.stock-out]="!product.inStock" style="margin-left:8px">
              {{ product.inStock ? '✓ In Stock (' + product.stockQuantity + ')' : '✗ Out of Stock' }}
            </span>
          </div>

          <div class="product-detail-price-row">
            <span class="product-detail-price">
              ₹{{ (product.discountedPrice ?? product.price) | number:'1.0-0' }}
            </span>
            <span class="product-detail-original" *ngIf="product.discountedPrice">
              ₹{{ product.price | number:'1.0-0' }}
            </span>
            <span class="discount-tag" *ngIf="product.discountPercent">
              Save {{ product.discountPercent }}%
            </span>
          </div>

          <p class="product-detail-desc">{{ product.description }}</p>

          <div class="qty-control">
            <span style="font-size:14px;font-weight:600;color:var(--text-2)">Quantity:</span>
            <button class="qty-btn" (click)="changeQty(-1)">−</button>
            <span class="qty-val">{{ quantity }}</span>
            <button class="qty-btn" (click)="changeQty(1)">+</button>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary btn-lg"
                    [disabled]="!product.inStock"
                    (click)="addToCart()">
              🛒 Add to Cart
            </button>
            <button class="btn btn-outline btn-lg"
                    [disabled]="!product.inStock"
                    (click)="buyNow()">
              ⚡ Buy Now
            </button>
          </div>

          <!-- Attributes -->
          <div class="product-attrs" *ngIf="attrEntries.length > 0">
            <div class="attr-item" *ngFor="let attr of attrEntries">
              <div class="attr-key">{{ attr.key }}</div>
              <div class="attr-val">{{ attr.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  </div>
  `,
})
// FIX: implement OnDestroy to unsubscribe from route params and prevent memory leaks
export class ProductDetailComponent implements OnInit, OnDestroy {

  product:  Product | null = null;
  loading   = true;
  quantity  = 1;

  private destroy$ = new Subject<void>();

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private productService: ProductService,
    private cartService:    CartService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  p  => { this.product = p; this.loading = false; },
        error: () => { this.loading = false; this.router.navigate(['/products']); },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeQty(d: number): void {
    this.quantity = Math.max(1, Math.min(
      this.quantity + d,
      this.product?.stockQuantity ?? 99,
    ));
  }

  addToCart(): void {
    if (this.product) this.cartService.addItem(this.product, this.quantity);
    this.router.navigate(['/cart']);
  }

  buyNow(): void {
    if (this.product) this.cartService.addItem(this.product, this.quantity);
    this.router.navigate(['/checkout']);
  }

  get attrEntries(): { key: string; value: any }[] {
    if (!this.product?.attributes) return [];
    return Object.entries(this.product.attributes)
      .map(([key, value]) => ({ key, value }));
  }

  getEmoji(category: string): string {
    const map: Record<string,string> = {
      'Electronics':'📱','Footwear':'👟','Apparel':'👕',
      'Home & Living':'🏠','Sports':'⚽',
    };
    return map[category] ?? '📦';
  }

  getStars(r: number): string {
    const f = Math.round(r);
    return '★'.repeat(f) + '☆'.repeat(5-f);
  }
}
