import { Component, OnInit, ViewChild } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  cartInfo: any;
  discountInfo = { amount: 0, couponCode: '' }; // Valor inicial
  user: any;
  loading = false;
  

  constructor(
    private cartService: CartService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log(this.cartItems);
    });
    const cartInfo = JSON.parse(localStorage.getItem('cartInfo'));
    console.log("carro de compras", cartInfo);
    this.cartInfo = cartInfo;
    this.getDiscountInfo();
    this.loadUserInfo();
  }

  loadUserInfo() {
    // Implementar la carga de información del usuario
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getDiscountInfo() {
    if (this.cartInfo && this.cartInfo.coupons && this.cartInfo.coupons.length > 0) {
      const codes = this.cartInfo.coupons.map(coupon => coupon.code).join(', ');
      console.log("codes", codes);
      this.discountInfo.couponCode = codes;
      this.discountInfo.amount = this.cartInfo.totalDiscount;
      console.log("discountInfo", this.discountInfo);
    }
  }

  getTotal(): number {
    return this.getSubtotal();
  }

  processOrder() {

  }
} 