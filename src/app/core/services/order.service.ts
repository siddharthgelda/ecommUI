// src/app/core/services/order.service.ts
import { Injectable }             from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }             from 'rxjs';
import { environment }            from '../../../environments/environment';
import { CancelOrderRequest, CreateOrderRequest,
         Order, OrderPage, OrderStatusHistoryDTO,
         OrderTracking }          from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private readonly BASE = environment.orderServiceUrl;

  constructor(private http: HttpClient) {}

  // ── Create ────────────────────────────────────────────────────

  createOrder(req: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.BASE}/orders`, req);
  }

  // ── Customer reads ────────────────────────────────────────────

  getMyOrders(page = 0, size = 10): Observable<OrderPage> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<OrderPage>(
      `${this.BASE}/orders/my-orders`, { params }
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.BASE}/orders/${id}`);
  }

  getTracking(id: string): Observable<OrderTracking> {
    return this.http.get<OrderTracking>(
      `${this.BASE}/orders/${id}/tracking`
    );
  }

  cancelOrder(id: string,
              req: CancelOrderRequest): Observable<Order> {
    return this.http.post<Order>(
      `${this.BASE}/orders/${id}/cancel`, req
    );
  }

  // ── Admin reads ───────────────────────────────────────────────

  getAllOrders(status?: string,
              page = 0,
              size = 20): Observable<OrderPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<OrderPage>(
      `${this.BASE}/orders`, { params }
    );
  }

  getOrdersByUser(userId: string,
                  page = 0): Observable<OrderPage> {
    const params = new HttpParams()
      .set('page', page).set('size', 10);
    return this.http.get<OrderPage>(
      `${this.BASE}/orders/user/${userId}`, { params }
    );
  }

  getStatusHistory(id: string): Observable<OrderStatusHistoryDTO[]> {
    return this.http.get<OrderStatusHistoryDTO[]>(
      `${this.BASE}/orders/${id}/history`
    );
  }

  // ── Admin writes ──────────────────────────────────────────────

  updateStatus(id: string, req: any): Observable<Order> {
    return this.http.patch<Order>(
      `${this.BASE}/orders/${id}/status`, req
    );
  }
}
