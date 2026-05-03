// src/app/core/services/cart.service.ts
import { Injectable }        from '@angular/core';
import { BehaviorSubject }   from 'rxjs';
import { CartItem, Product } from '../models';


@Injectable({ providedIn: 'root' })
export class CartService {

  private readonly STORAGE_KEY = 'pbp_cart';

  private items$ = new BehaviorSubject<CartItem[]>(
    this.loadFromStorage()
  );

  /** Full cart item list */
  cart$ = this.items$.asObservable();

  /** Running total item count (sum of quantities) */
  itemCount$ = new BehaviorSubject<number>(
    this.calculateCount(this.items$.getValue())
  );

  // ── Add ───────────────────────────────────────────────────────

  addItem(product: Product, quantity = 1): void {
    const items = [...this.items$.getValue()];
    const idx   = items.findIndex(i => i.product.id === product.id);

    if (idx > -1) {
      // Increment — cap at available stock
      items[idx] = {
        ...items[idx],
        quantity: Math.min(
          items[idx].quantity + quantity,
          product.stockQuantity
        ),
      };
    } else {
      items.push({ product, quantity: Math.min(quantity, product.stockQuantity) });
    }

    this.commit(items);
  }

  // ── Update quantity ───────────────────────────────────────────

  updateQuantity(productId: string, quantity: number): void {
    // FIX: cap quantity at the product's stockQuantity, not just > 0
    const items = this.items$.getValue()
      .map(i => {
        if (i.product.id !== productId) return i;
        const capped = Math.min(quantity, i.product.stockQuantity);
        return { ...i, quantity: capped };
      })
      .filter(i => i.quantity > 0);

    this.commit(items);
  }

  // ── Remove ────────────────────────────────────────────────────

  removeItem(productId: string): void {
    this.commit(
      this.items$.getValue().filter(i => i.product.id !== productId)
    );
  }

  // ── Clear ─────────────────────────────────────────────────────

  clear(): void {
    this.commit([]);
  }

  // ── Queries ───────────────────────────────────────────────────

  getItems(): CartItem[] {
    return this.items$.getValue();
  }

  isEmpty(): boolean {
    return this.items$.getValue().length === 0;
  }

  getSubtotal(): number {
    return this.items$.getValue().reduce((sum, item) => {
      const price = item.product.discountedPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }

  getShipping(): number {
    return this.getSubtotal() >= 500 ? 0 : 49;
  }

  getTax(): number {
    return Math.round(this.getSubtotal() * 0.18 * 100) / 100;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  getTotalCount(): number {
    return this.calculateCount(this.items$.getValue());
  }

  hasProduct(productId: string): boolean {
    return this.items$.getValue().some(i => i.product.id === productId);
  }

  getQuantity(productId: string): number {
    return this.items$.getValue()
      .find(i => i.product.id === productId)?.quantity ?? 0;
  }

  // ── Private ───────────────────────────────────────────────────

  private commit(items: CartItem[]): void {
    this.items$.next(items);
    this.itemCount$.next(this.calculateCount(items));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private calculateCount(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
