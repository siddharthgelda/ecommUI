// src/app/features/orders/orders/components/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService }     from '../../../core/services/order.service';
import { Order }            from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  template: `
  <div class="container page">
    <div class="breadcrumb">
      <a routerLink="/">Home</a><span class="breadcrumb-sep">›</span>
      <a routerLink="/orders">Orders</a><span class="breadcrumb-sep">›</span>
      <span>Order Details</span>
    </div>

    <div class="loading-wrap" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <ng-container *ngIf="!loading && order">
      <div class="section-header">
        <h1 class="section-title"><div *ngIf="order as o">
                                    Order #{{ o.id.substring(0,8).toUpperCase() }}
                                  </div></h1>
        <div class="stock-badge stock-in"><div *ngIf="order.statusLabel">
                                             {{order.statusLabel }}
                                          </div>
      </div>

      <!-- Items -->
      <div class="card" style="padding:24px;margin-bottom:20px">
        <div class="checkout-section-title" style="margin-bottom:16px">📦 Items</div>
        <div *ngFor="let item of order.items" style="display:flex;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-weight:600">{{ item.productName }}</div>
            <div style="font-size:12px;color:var(--text-3)">SKU: {{ item.productSku }} · Qty: {{ item.quantity }}</div>
          </div>
          <div style="font-weight:700;color:var(--accent)">₹{{ item.lineTotal | number:'1.0-0' }}</div>
        </div>

        <div class="summary-row" style="margin-top:16px"><span>Subtotal</span><span class="summary-val">₹{{ order.subtotal | number:'1.0-0' }}</span></div>
        <div class="summary-row"><span>Shipping</span><span class="summary-val">₹{{ order.shippingCharge | number:'1.0-0' }}</span></div>
        <div class="summary-row"><span>GST</span><span class="summary-val">₹{{ order.taxAmount | number:'1.0-2' }}</span></div>
        <div class="summary-row total"><span>Total</span><span class="summary-val accent">₹{{ order.totalAmount | number:'1.0-0' }}</span></div>
      </div>

      <!-- Address -->
      <div class="card" style="padding:24px;margin-bottom:20px">
        <div class="checkout-section-title" style="margin-bottom:12px">📍 Shipping Address</div>
        <div>{{ order.shippingAddress.formattedAddress }}</div>
      </div>

      <button class="btn btn-ghost" routerLink="/orders">← Back to Orders</button>
    </ng-container>
  </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order:   Order | null = null;
  loading = true;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrder(id).subscribe({
      next:  o  => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/orders']); },
    });
  }
}
