// src/app/features/home/home/home.component.ts
import { Component, OnInit }  from '@angular/core';
import { Router }             from '@angular/router';
import { ProductService }     from '../../../core/services/product.service';
import { CartService }        from '../../../core/services/cart.service';
import { Product, Category }  from '../../../core/models';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
    imports: [CommonModule],
  template: `
  <div>
    <!-- Hero Banner -->
    <div class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-badge">🛍️ Premium eCommerce Platform</div>
          <h1 class="hero-title">Shop the Best<br>Brands & Deals</h1>
          <p class="hero-subtitle">Discover thousands of products with fast delivery and easy returns.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" routerLink="/products">Shop Now →</button>
            <button class="btn btn-outline btn-lg" routerLink="/products">Browse Categories</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="container page">
      <div class="section-header">
        <div>
          <div class="section-title">Shop by Category</div>
          <div class="section-subtitle">Find exactly what you're looking for</div>
        </div>
      </div>
      <div class="category-grid" *ngIf="categories.length > 0">
        <div class="category-card" *ngFor="let cat of categories" (click)="browseCat(cat.id)">
          <div class="category-icon">{{ getCatEmoji(cat.name) }}</div>
          <div class="category-name">{{ cat.name }}</div>
        </div>
      </div>

      <!-- Featured Products -->
      <div class="section-header" style="margin-top:48px">
        <div>
          <div class="section-title">Featured Products</div>
          <div class="section-subtitle">Hand-picked just for you</div>
        </div>
        <a class="btn btn-ghost btn-sm" routerLink="/products">View All →</a>
      </div>

      <div class="loading-wrap" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div class="product-grid" *ngIf="!loading">
        <div class="card product-card" *ngFor="let p of featured" (click)="openProduct(p.id)">
          <div class="product-img-wrap">
            <img *ngIf="p.imageUrls?.[0]" [src]="p.imageUrls[0]" [alt]="p.name" class="product-img"/>
            <div *ngIf="!p.imageUrls?.[0]" class="product-img-placeholder">
              {{ getCatEmoji(p.category.name) }}
            </div>
            <span class="product-badge" *ngIf="p.discountPercent">-{{ p.discountPercent }}%</span>
          </div>
          <div class="product-info">
            <div class="product-category">{{ p.category.name }}</div>
            <div class="product-name">{{ p.name }}</div>
            <div class="product-price-row">
              <span class="product-price">₹{{ (p.discountedPrice ?? p.price) | number:'1.0-0' }}</span>
              <span class="product-price-original" *ngIf="p.discountedPrice">₹{{ p.price | number:'1.0-0' }}</span>
            </div>
            <div class="product-actions" (click)="$event.stopPropagation()">
              <button class="btn btn-primary btn-sm" [disabled]="!p.inStock" (click)="addToCart(p)">
                {{ p.inStock ? '🛒 Add to Cart' : 'Out of Stock' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class HomeComponent implements OnInit {
  featured:   Product[]  = [];
  categories: Category[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService:    CartService,
    private router:         Router,
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: cats => this.categories = cats.slice(0, 8),
      error: () => {},
    });
    this.productService.getFeatured(8).subscribe({
      next: page => { this.featured = page.content; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  browseCat(id: number): void {
    this.router.navigate(['/products'], { queryParams: { categoryId: id } });
  }

  openProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  addToCart(p: Product): void {
    this.cartService.addItem(p);
  }

  getCatEmoji(name: string): string {
    const map: Record<string, string> = {
      'Electronics': '📱', 'Footwear': '👟', 'Apparel': '👕',
      'Home & Living': '🏠', 'Sports': '⚽',
    };
    return map[name] ?? '🛍️';
  }
}
