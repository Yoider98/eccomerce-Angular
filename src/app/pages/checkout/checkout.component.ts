import { Component, OnInit, ViewChild } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CheckoutService } from 'src/app/services/checkout.service';

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
    private checkoutService: CheckoutService,
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
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("user", user);
    this.checkoutService.createPreference(this.cartItems, user, true)
    .subscribe(res => {
      console.log('Respuesta de Mercado Pago:', res);
      this.loading = false;
      if(res.status == "success"){
        localStorage.setItem("cartId", res.cartId);
        if (res.sandboxInitPoint) {
          console.log('Redirigiendo a:', res.sandboxInitPoint);
          window.location.href = res.sandboxInitPoint; // ✅ LLEVA AL USUARIO AL CHECKOUT DE MERCADO PAGO
        } else {
          console.error('No se recibió URL de Mercado Pago');
        }
      } else {
        this.handleError(res);
      }
    }, err => {
      this.loading = false;
      console.error('Error al crear preferencia:', err);
      this.handleError(err);
    });
  }

  private handleError(error: any) {
    let errorMessage = 'No se pudo procesar el pago';
    let errorDetails = '';

    if (error.error && Array.isArray(error.error)) {
      errorDetails = error.error.map((err, index) => `
        <div class="error-item" style="
          background-color: #fff3f3;
          border-left: 4px solid #ff4444;
          padding: 10px;
          margin: 8px 0;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; align-items: center;">
            <span style="
              background-color: #ff4444;
              color: white;
              width: 54px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
              font-size: 14px;
            ">${index + 1}</span>
            <span style="color: #333;">${err}</span>
          </div>
        </div>
      `).join('');
    } else if (error.error && typeof error.error === 'string') {
      errorDetails = `
        <div class="error-item" style="
          background-color: #fff3f3;
          border-left: 4px solid #ff4444;
          padding: 10px;
          margin: 8px 0;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <span style="color: #333;">${error.error}</span>
        </div>
      `;
    }

    Swal.fire({
      icon: 'error',
      title: 'Error en el proceso',
      html: `
        <div style="text-align: center; margin-bottom: 15px;">
          <p style="color: #666; font-size: 16px;">${errorMessage}</p>
        </div>
        ${errorDetails ? `
          <div style="
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin-top: 15px;
          ">
            ${errorDetails}
          </div>
        ` : ''}
      `,
      confirmButtonText: 'Entendido',
      customClass: {
        container: 'custom-swal-container',
        popup: 'custom-swal-popup',
        title: 'custom-swal-title'
      }
    });
  }
} 