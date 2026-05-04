// src/app/features/orders/orders/components/order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { OrderService }      from '../../../core/services/order.service';
import { OrderSummary }      from '../../../core/models';

@Component({
  selector: 'app-order-list',
  template: `
  <div class="container page">
    <div class="breadcrumb">
      <a routerLink="/">Home</a><span class="breadcrumb-sep">›</span>
      <span>My Orders</span>
    </div>
    <div class="section-header">
      <h1 class="section-title">My Orders</h1>
    </div>

    <div class="loading-wrap" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <div *ngIf="!loading && orders.length === 0" class="loading-wrap">
      <p style="color:var(--text-3)">No orders yet. <a routerLink="/products">Start shopping!</a></p>
    </div>

    <div *ngIf="!loading && orders.length > 0">
      <div class="card" style="padding:20px;margin-bottom:16px;cursor:pointer"
           *ngFor="let o of orders" (click)="viewOrder(o.id)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-weight:700;font-size:15px">{{ o.primaryProductName }}</div>
            <div style="font-size:12px;color:var(--text-3);margin-top:4px">
              Order #{{ o.id.substring(0,8).toUpperCase() }} · {{ o.createdAt | date:'mediumDate' }}
            </div>
          </div>
          <div style="text-align:right">
            <div class="stock-badge stock-in" style="margin-bottom:6px">{{ o.statusLabel }}</div>
            <div style="font-weight:700;color:var(--accent)">₹{{ o.totalAmount | number:'1.0-0' }}</div>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" (click)="changePage(page-1)" [disabled]="page===0">‹</button>
        <button class="page-btn" *ngFor="let p of pageArr"
                [class.active]="p===page" (click)="changePage(p)">{{ p+1 }}</button>
        <button class="page-btn" (click)="changePage(page+1)" [disabled]="page===totalPages-1">›</button>
      </div>
    </div>
  </div>
  `,
})
export class OrderListComponent implements OnInit {
  orders:     OrderSummary[] = [];
  loading     = true;
  page        = 0;
  totalPages  = 0;

  constructor(
    private orderService: OrderService,
    private router:       Router,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.orderService.getMyOrders(this.page).subscribe({
      next: res => {
        this.orders     = res.content;
        this.totalPages = res.totalPages;
        this.loading    = false;
      },
      error: () => { this.loading = false; },
    });
  }

  viewOrder(id: string): void { this.router.navigate(['/orders', id]); }

  changePage(p: number): void {
    this.page = p;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageArr(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
