// src/app/core/services/product.service.ts
import { Injectable }                   from '@angular/core';
import { HttpClient, HttpParams }       from '@angular/common/http';
import { Observable }                   from 'rxjs';
import { environment }                  from '../../../environments/environment';
import { Category, Product,
         ProductFilter, ProductPage }   from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly BASE = environment.productServiceUrl;

  constructor(private http: HttpClient) {}

  // ── Products ──────────────────────────────────────────────────

  getProducts(filter: ProductFilter = {}): Observable<ProductPage> {
    let params = new HttpParams();

    if (filter.categoryId != null)
      params = params.set('categoryId', filter.categoryId);
    if (filter.minPrice != null)
      params = params.set('minPrice',   filter.minPrice);
    if (filter.maxPrice != null)
      params = params.set('maxPrice',   filter.maxPrice);
    if (filter.keyword)
      params = params.set('keyword',    filter.keyword);
    if (filter.sortBy)
      params = params.set('sortBy',     filter.sortBy);
    if (filter.page != null)
      params = params.set('page',       filter.page);

    params = params.set('size', filter.size ?? 12);

    return this.http.get<ProductPage>(`${this.BASE}/products`, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.BASE}/products/${id}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Product[]>(
      `${this.BASE}/products/search`, { params }
    );
  }

  getFeatured(size = 8): Observable<ProductPage> {
    return this.getProducts({ sortBy: 'rating', size });
  }

  getNewArrivals(size = 8): Observable<ProductPage> {
    return this.getProducts({ sortBy: 'newest', size });
  }

  getByCategory(categoryId: number,
                page = 0,
                size = 12): Observable<ProductPage> {
    return this.getProducts({ categoryId, page, size });
  }

  // ── Admin product operations ──────────────────────────────────

  createProduct(req: any): Observable<Product> {
    return this.http.post<Product>(`${this.BASE}/products`, req);
  }

  updateProduct(id: string, req: any): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/products/${id}`, req);
  }

  deactivateProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/products/${id}`);
  }

  // ── Categories ────────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories`);
  }

  getCategoryTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories/tree`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.BASE}/categories/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.BASE}/categories/slug/${slug}`);
  }

  searchCategories(q: string): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.BASE}/categories/search`, { params: { q } }
    );
  }
}
