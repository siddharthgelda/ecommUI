import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,                 // ✅ MUST BE TRUE
  imports: [CommonModule, RouterModule],
  template: `
    <nav style="padding:10px; background:#eee;">
      <a routerLink="/">Home</a> |
      <a routerLink="/products">Products</a> |
      <a routerLink="/cart">Cart</a>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {}
