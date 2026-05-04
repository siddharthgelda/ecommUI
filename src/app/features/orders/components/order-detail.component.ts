// src/app/features/orders/components/order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
   styleUrls: ['./orders.component.scss'],
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
  <div class="container page">

    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <a routerLink="/">Home</a>
      <span class="breadcrumb-sep">›</span>
      <a routerLink="/orders">Orders</a>
      <span class="breadcrumb-sep">›</span>
      <span>Order Details</span>
    </div>

    <!-- Loading -->
    <div class="loading-wrap" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <!-- Content -->
    <ng-container *ngIf="!loading && order as o">

      <div class="section-header">
        <h1 class="section-title">
          Order #{{ o.id.substring(0,8).toUpperCase() }}
        </h1>

        <div class="stock-badge stock-in" *ngIf="o.statusLabel">
          {{ o.statusLabel }}
        </div>
      </div>

      <!-- Items -->
      <div class="card" style="padding:24px;margin-bottom:20px">
        <div class="checkout-section-title" style="margin-bottom:16px">
          📦 Items
        </div>

        <div *ngFor="let item of o.items"
             style="display:flex;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)">

          <div style="flex:1">
            <div style="font-weight:600">{{ item.productName }}</div>
            <div style="font-size:12px;color:var(--text-3)">
              SKU: {{ item.productSku }} · Qty: {{ item.quantity }}
            </div>
          </div>

          <div style="font-weight:700;color:var(--accent)">
            ₹{{ item.lineTotal | number:'1.0-0' }}
          </div>
        </div>

        <!-- Summary -->
        <div class="summary-row" style="margin-top:16px">
          <span>Subtotal</span>
          <span class="summary-val">₹{{ o.subtotal | number:'1.0-0' }}</span>
        </div>

        <div class="summary-row">
          <span>Shipping</span>
          <span class="summary-val">₹{{ o.shippingCharge | number:'1.0-0' }}</span>
        </div>

        <div class="summary-row">
          <span>GST</span>
          <span class="summary-val">₹{{ o.taxAmount | number:'1.0-2' }}</span>
        </div>

        <div class="summary-row total">
          <span>Total</span>
          <span class="summary-val accent">
            ₹{{ o.totalAmount | number:'1.0-0' }}
          </span>
        </div>
      </div>

      <!-- Address -->
      <div class="card" style="padding:24px;margin-bottom:20px">
        <div class="checkout-section-title" style="margin-bottom:12px">
          📍 Shipping Address
        </div>
        <div>{{ o.shippingAddress.formattedAddress }}</div>
      </div>

      <button class="btn btn-ghost" routerLink="/orders">
        ← Back to Orders
      </button>

    </ng-container>

  </div>
  `
})
export class OrderDetailComponent implements OnInit {

  order: Order | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/orders']);
      return;
    }

    this.orderService.getOrder(id).subscribe({
      next: o => {
        this.order = o;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/orders']);
      },
    });
  }
}
