// src/app/features/products/components/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router }                       from '@angular/router';
import { Subject }                      from 'rxjs';
import { debounceTime, distinctUntilChanged,
         takeUntil }                    from 'rxjs/operators';
import { ProductService }               from '../../../core/services/product.service';
import { CartService }                  from '../../../core/services/cart.service';
import { Category, Product,
         ProductFilter, ProductPage }   from '../../../core/models';
import { FormsModule } from '@angular/forms'; // ✅ ADD THIS
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-product-list',
   imports: [
      CommonModule,
      FormsModule   // ✅ REQUIRED for ngModel
    ],
   styleUrls: ['./product-list.component.scss'],
  template: `
  <div class="container page">

    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <a routerLink="/">Home</a>
      <span class="breadcrumb-sep">›</span>
      <span>Products</span>
    </div>

    <div class="section-header">
      <div>
        <h1 class="section-title">All Products</h1>
        <div class="section-subtitle">{{ totalElements }} products found</div>
      </div>
    </div>

    <!-- Category pills -->
    <div class="category-pills">
      <div class="pill" [class.active]="!selectedCategory"
           (click)="filterCategory(null)">All</div>
      <div class="pill" *ngFor="let cat of categories"
           [class.active]="selectedCategory === cat.id"
           (click)="filterCategory(cat.id)">
        {{ cat.name }}
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-range">
        <label>Price:</label>
        <input type="number" [(ngModel)]="minPrice" placeholder="Min" style="width:90px"/>
        <span>—</span>
        <input type="number" [(ngModel)]="maxPrice" placeholder="Max" style="width:90px"/>
      </div>
      <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
        <option value="">Sort: Default</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
        <option value="rating">Top Rated</option>
        <option value="newest">Newest</option>
      </select>
      <button class="btn btn-outline btn-sm" (click)="applyFilters()">Apply</button>
      <button class="btn btn-ghost  btn-sm" (click)="clearFilters()">Clear</button>
    </div>

    <!-- Loading -->
    <div class="loading-wrap" *ngIf="loading">
      <div class="spinner"></div>
      <span>Loading products…</span>
    </div>

    <!-- Grid -->
    <div class="product-grid" *ngIf="!loading && products.length > 0">
      <div class="card product-card"
           *ngFor="let p of products"
           (click)="openProduct(p.id)">
        <div class="product-img-wrap">
          <img *ngIf="p.imageUrls?.[0]"
               [src]="p.imageUrls[0]" [alt]="p.name" class="product-img"/>
          <div *ngIf="!p.imageUrls?.[0]" class="product-img-placeholder">
            {{ getCategoryEmoji(p.category.name) }}
          </div>
          <span class="product-badge" *ngIf="p.discountPercent">
            -{{ p.discountPercent }}%
          </span>
        </div>
        <div class="product-info">
          <div class="product-category">{{ p.category.name }}</div>
          <div class="product-name">{{ p.name }}</div>
          <div class="product-rating">
            <span class="stars">{{ getStars(p.averageRating) }}</span>
            {{ p.averageRating | number:'1.1-1' }}
            ({{ p.reviewCount }})
          </div>
          <div class="product-price-row">
            <span class="product-price">
              ₹{{ (p.discountedPrice ?? p.price) | number:'1.0-0' }}
            </span>
            <span class="product-price-original" *ngIf="p.discountedPrice">
              ₹{{ p.price | number:'1.0-0' }}
            </span>
          </div>
          <div class="product-actions" (click)="$event.stopPropagation()">
            <button class="btn btn-primary btn-sm"
                    [disabled]="!p.inStock"
                    (click)="addToCart(p)">
              {{ p.inStock ? '🛒 Add to Cart' : 'Out of Stock' }}
            </button>
            <span class="stock-badge" [class.stock-in]="p.inStock"
                  [class.stock-out]="!p.inStock">
              {{ p.inStock ? p.stockQuantity + ' left' : 'OOS' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div class="loading-wrap" *ngIf="!loading && products.length === 0">
      <p style="color:var(--text-3)">No products match your filters.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="totalPages > 1">
      <button class="page-btn" (click)="changePage(currentPage-1)"
              [disabled]="currentPage === 0">‹</button>
      <button class="page-btn"
              *ngFor="let p of pageNumbers"
              [class.active]="p === currentPage"
              (click)="changePage(p)">{{ p + 1 }}</button>
      <button class="page-btn" (click)="changePage(currentPage+1)"
              [disabled]="currentPage === totalPages - 1">›</button>
    </div>

  </div>
  `,
})
export class ProductListComponent implements OnInit, OnDestroy {

  products:          Product[] = [];
  categories:        Category[] = [];
  loading            = true;
  totalElements      = 0;
  totalPages         = 0;
  currentPage        = 0;
  selectedCategory:  number | null = null;
  minPrice:          number | undefined;
   maxPrice:          number | undefined;
//  minPrice: number = 0;
  //  maxPrice: number = 0;
  sortBy             = '';

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService:    CartService,
    private router:         Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: cats => this.categories = cats, error: () => {} });
  }

  loadProducts(): void {
    this.loading = true;
    const filter: ProductFilter = {
      page:       this.currentPage,
      size:       12,
      categoryId: this.selectedCategory ?? undefined,
      minPrice:   this.minPrice,
      maxPrice:   this.maxPrice,
      sortBy:     this.sortBy || undefined,
    };

    this.productService.getProducts(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: ProductPage) => {
          this.products       = page.content;
          this.totalElements  = page.totalElements;
          this.totalPages     = page.totalPages;
          this.loading        = false;
        },
        error: () => { this.loading = false; },
      });
  }

  filterCategory(id: number | null): void {
    this.selectedCategory = id;
    this.currentPage      = 0;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.minPrice         = 0;
    this.maxPrice         = 0;
    this.sortBy           = '';
    this.currentPage      = 0;
    this.loadProducts();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getCategoryEmoji(category: string): string {
    const map: Record<string, string> = {
      'Electronics':'📱', 'Footwear':'👟', 'Apparel':'👕',
      'Home & Living':'🏠', 'Sports':'⚽',
    };
    return map[category] ?? '📦';
  }

  getStars(rating: number): string {
    const full  = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}
