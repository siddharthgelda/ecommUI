import { Component }    from '@angular/core';
import { Router }       from '@angular/router';
import { CartService }  from '../../core/services/cart.service';
import { AuthService }  from '../../core/services/auth.service';
import { CartItem }     from '../../core/models';
import { CommonModule } from '@angular/common'; // ✅ REQUIRED
@Component({
  imports: [CommonModule],
  selector: 'app-cart',
  template: `
  <div class="container page">
    <div class="breadcrumb">
      <a routerLink="/">Home</a><span class="breadcrumb-sep">›</span>
      <span>Cart</span>
    </div>
    <div class="section-header">
      <h1 class="section-title">Shopping Cart</h1>
    </div>

    <!-- Empty -->
    <div class="cart-empty" *ngIf="cart.isEmpty()">
      <div class="cart-empty-icon">🛒</div>
      <div class="cart-empty-title">Your cart is empty</div>
      <div class="cart-empty-sub">Start adding products!</div>
      <button class="btn btn-primary" routerLink="/products">Shop Now</button>
    </div>

    <!-- Cart items + summary -->
    <div class="cart-layout" *ngIf="!cart.isEmpty()">
      <div>
        <div class="cart-item-row" *ngFor="let item of cart.getItems()">
          <div class="cart-item-img">
            <img *ngIf="item.product.imageUrls?.[0]"
                 [src]="item.product.imageUrls[0]" [alt]="item.product.name"/>
            <span *ngIf="!item.product.imageUrls?.[0]" style="font-size:32px">
              {{ getEmoji(item.product.category.name) }}
            </span>
          </div>
          <div>
            <div class="cart-item-name">{{ item.product.name }}</div>
            <div class="cart-item-sku">{{ item.product.sku }}</div>
            <div class="cart-item-price">
              ₹{{ (item.product.discountedPrice ?? item.product.price) | number:'1.0-0' }}
            </div>
          </div>
          <div class="cart-item-controls">
            <div style="display:flex;align-items:center;gap:8px">
              <button class="qty-btn"
                (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">−</button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn"
                (click)="cart.updateQuantity(item.product.id, item.quantity + 1)">+</button>
            </div>
            <div style="font-weight:700;color:var(--accent);font-family:var(--font-mono)">
              ₹{{ ((item.product.discountedPrice ?? item.product.price) * item.quantity) | number:'1.0-0' }}
            </div>
            <button class="btn btn-ghost btn-sm"
                    style="color:var(--error)"
                    (click)="cart.removeItem(item.product.id)">
              🗑 Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="cart-summary-card">
        <div class="summary-title">Order Summary</div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span class="summary-val">₹{{ cart.getSubtotal() | number:'1.0-0' }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span class="summary-val" [class.accent]="cart.getShipping()===0">
            {{ cart.getShipping() === 0 ? 'FREE' : '₹' + cart.getShipping() }}
          </span>
        </div>
        <div class="summary-row">
          <span>GST (18%)</span>
          <span class="summary-val">₹{{ cart.getTax() | number:'1.0-2' }}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span class="summary-val accent">₹{{ cart.getTotal() | number:'1.0-0' }}</span>
        </div>
        <button class="btn btn-primary btn-block btn-lg"
                style="margin-top:20px"
                (click)="checkout()">
          Proceed to Checkout →
        </button>
        <button class="btn btn-ghost btn-block"
                style="margin-top:8px"
                routerLink="/products">
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
  `,
})
export class CartComponent {
  constructor(
    public  cart:   CartService,
    private auth:   AuthService,
    private router: Router,
  ) {}

  checkout(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  getEmoji(cat: string): string {
    const m: Record<string,string> = {
      'Electronics':'📱','Footwear':'👟','Apparel':'👕',
      'Home & Living':'🏠','Sports':'⚽',
    };
    return m[cat] ?? '📦';
  }
}

