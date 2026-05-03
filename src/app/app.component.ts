import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  title = 'ShopPBP';
  cartCount = 0;
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  showDropdown = false;

  constructor(
    public auth: AuthService,
    private cart: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cart.itemCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.auth.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'ADMIN';
      this.userName = user?.fullName?.split(' ')[0] ?? '';
    });
  }

  logout(): void {
    this.showDropdown = false;
    this.auth.logout();
  }

  navigate(path: string): void {
    this.showDropdown = false;
    this.router.navigate([path]);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }
}
