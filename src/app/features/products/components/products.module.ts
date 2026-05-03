// src/app/features/products/products.module.ts
import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule }          from '@angular/forms';
import { ProductListComponent } from './components/product-list.component';
import { ProductDetailComponent } from './components/product-detail.component';

const routes: Routes = [
  { path: '',    component: ProductListComponent   },
  { path: ':id', component: ProductDetailComponent },
];

@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
  ],
})
export class ProductsModule {}
