// src/app/features/checkout/checkout.component.ts
import { Component, OnInit }    from '@angular/core';

import { Router }               from '@angular/router';
import { CartService }          from '../../core/services/cart.service';
import { OrderService }         from '../../core/services/order.service';
import { AuthService }          from '../../core/services/auth.service';
import { PaymentMethod }        from '../../core/models';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-checkout',
   standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      RouterModule   // ✅ needed for routerLink etc.
    ]
  template: `
  <div class="container page">
    <div class="breadcrumb">
      <a routerLink="/">Home</a><span class="breadcrumb-sep">›</span>
      <a routerLink="/cart">Cart</a><span class="breadcrumb-sep">›</span>
      <span>Checkout</span>
    </div>
    <div class="section-header">
      <h1 class="section-title">Checkout</h1>
    </div>

    <!-- Guard: form may be null before ngOnInit -->
    <ng-container *ngIf="form">
      <div class="checkout-grid">
        <div>
          <form [formGroup]="form" (ngSubmit)="placeOrder()">

            <!-- Address -->
            <div class="checkout-section">
              <div class="checkout-section-title">📍 Shipping Address</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" formControlName="recipientName"/>
                  <div class="form-error" *ngIf="f['recipientName'].invalid && f['recipientName'].touched">Required</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone *</label>
                  <input type="text" class="form-control" formControlName="phone"/>
                  <div class="form-error" *ngIf="f['phone'].invalid && f['phone'].touched">Valid 10-digit number required</div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address Line 1 *</label>
                <input type="text" class="form-control" formControlName="addressLine1"/>
              </div>
              <div class="form-group">
                <label class="form-label">Address Line 2</label>
                <input type="text" class="form-control" formControlName="addressLine2"/>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">City *</label>
                  <input type="text" class="form-control" formControlName="city"/>
                </div>
                <div class="form-group">
                  <label class="form-label">State *</label>
                  <input type="text" class="form-control" formControlName="state"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Pincode *</label>
                  <input type="text" class="form-control" formControlName="pincode"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Country *</label>
                  <input type="text" class="form-control" formControlName="country"/>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="checkout-section">
              <div class="checkout-section-title">💳 Payment Method</div>
              <div class="payment-opts">
                <div class="payment-opt" *ngFor="let pm of paymentMethods"
                     [class.selected]="selectedPayment === pm.value"
                     (click)="selectedPayment = pm.value">
                  <span class="payment-icon">{{ pm.icon }}</span>
                  {{ pm.label }}
                </div>
              </div>
            </div>

            <div class="form-error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </form>
        </div>

        <!-- Summary -->
        <div class="cart-summary-card">
          <div class="summary-title">Order Summary</div>
          <div class="summary-row" *ngFor="let item of cart.getItems()">
            <span>{{ item.product.name }} ×{{ item.quantity }}</span>
            <span class="summary-val">
              ₹{{ ((item.product.discountedPrice ?? item.product.price) * item.quantity) | number:'1.0-0' }}
            </span>
          </div>
          <div class="summary-row"><span>Shipping</span>
            <span class="summary-val" [class.accent]="cart.getShipping()===0">
              {{ cart.getShipping() === 0 ? 'FREE' : '₹' + cart.getShipping() }}
            </span>
          </div>
          <div class="summary-row"><span>GST</span>
            <span class="summary-val">₹{{ cart.getTax() | number:'1.0-2' }}</span>
          </div>
          <div class="summary-row total"><span>Total</span>
            <span class="summary-val accent">₹{{ cart.getTotal() | number:'1.0-0' }}</span>
          </div>
          <button class="btn btn-primary btn-block btn-lg"
                  style="margin-top:20px"
                  [disabled]="loading || form.invalid"
                  (click)="placeOrder()">
            {{ loading ? '⏳ Placing order…' : '🔒 Place Order · ₹' + (cart.getTotal() | number:'1.0-0') }}
          </button>
        </div>
      </div>
    </ng-container>
  </div>
  `,
})
export class CheckoutComponent implements OnInit {

  // FIX: use FormGroup | null instead of definite assignment assertion
  // to avoid template errors before ngOnInit initialises the form
  form:             FormGroup | null = null;
  loading           = false;
  errorMsg          = '';
  selectedPayment:  PaymentMethod = 'UPI';

  paymentMethods = [
    { value: 'UPI',         label: 'UPI',             icon: '📲' },
    { value: 'CARD',        label: 'Card',             icon: '💳' },
    { value: 'NET_BANKING', label: 'Net Banking',      icon: '🏦' },
    { value: 'COD',         label: 'Cash on Delivery', icon: '💵' },
  ];

  constructor(
    private fb:     FormBuilder,
    public  cart:   CartService,
    private orders: OrderService,
    private auth:   AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.cart.isEmpty()) { this.router.navigate(['/cart']); return; }

    const user = this.auth.getCurrentUser();
    this.form = this.fb.group({
      recipientName: [user?.fullName ?? '', Validators.required],
      phone:         ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      addressLine1:  ['', Validators.required],
      addressLine2:  [''],
      city:          ['', Validators.required],
      state:         ['', Validators.required],
      pincode:       ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
      country:       ['India', Validators.required],
    });
  }

  get f() { return this.form!.controls; }

  placeOrder(): void {
    if (!this.form || this.form.invalid) { this.form?.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    const req = {
      items: this.cart.getItems().map(i => ({
        productId: i.product.id, quantity: i.quantity,
      })),
      shippingAddress: this.form.value,
      paymentMethod:   this.selectedPayment,
    };

    this.orders.createOrder(req as any).subscribe({
      next: order => {
        this.cart.clear();
        this.router.navigate(['/orders', order.id]);
      },
      error: err => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Order failed. Please try again.';
      },
    });
  }
}
