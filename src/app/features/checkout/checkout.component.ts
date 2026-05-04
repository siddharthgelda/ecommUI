import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentMethod } from '../../core/models';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './checkout.component.html',   // ✅ moved HTML out
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  form: FormGroup | null = null;
  loading = false;
  errorMsg = '';

  selectedPayment: PaymentMethod = 'UPI';

  // ✅ Strong typing (fixes TS2322)
  paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'UPI',  label: 'UPI',               icon: '📲' },
    { value: 'CARD', label: 'Card',              icon: '💳' },
    { value: 'COD',  label: 'Cash on Delivery',  icon: '💵' },
  ];

  constructor(
    private fb: FormBuilder,
    public cart: CartService,
    private orders: OrderService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.cart.isEmpty()) {
      this.router.navigate(['/cart']);
      return;
    }

    const user = this.auth.getCurrentUser();

    this.form = this.fb.group({
      recipientName: [user?.fullName ?? '', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
      country: ['India', Validators.required],
    });
  }

  get f() {
    return this.form!.controls;
  }

  placeOrder(): void {
    if (!this.form || this.form.invalid) {
      this.form?.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const req = {
      items: this.cart.getItems().map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      shippingAddress: this.form.value,
      paymentMethod: this.selectedPayment,
    };

    this.orders.createOrder(req as any).subscribe({
      next: order => {
        this.cart.clear();
        this.router.navigate(['/orders', order.id]);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Order failed. Please try again.';
      },
    });
  }
}
