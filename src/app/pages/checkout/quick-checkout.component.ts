import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from '../../services/checkout.service';
import Swal from 'sweetalert2';

declare var MercadoPago: any;
@Component({
  selector: 'app-quick-checkout',
  templateUrl: './quick-checkout.component.html',
  styleUrls: ['./quick-checkout.component.scss']
})
export class QuickCheckoutComponent implements OnInit {

  mp: any;
  cardForm: any;
  
  quickCheckoutForm: FormGroup;
  cartItems: any[] = [];
  cartInfo: any;
  discountInfo = { amount: 0, couponCode: '' }; // Valor inicial
  loading = false;
  shippingCost = 0;
  departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
    'Vaupés', 'Vichada'
  ];


  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.quickCheckoutForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(3)]],
      departamento: ['', Validators.required]
    });
  }

  ngOnInit() {
   
    this.cartItems = this.cartService.getCartItems();
    this.calculateShippingCost();
    const cartInfo = JSON.parse(localStorage.getItem('cartInfo'));
    console.log("carro de compras", cartInfo);
    this.cartInfo = cartInfo;
    this.getDiscountInfo();


    this.mp = new MercadoPago('TEST-c0ac9745-7aff-4395-8d1c-1e9e870399dc', {
      locale: 'es-CO',
    });

  }

  getSubtotal(): number {
    const subtotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    console.log('Items en el carrito:', this.cartItems);
    return subtotal;
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
  calculateShippingCost() {
    // Lógica para calcular el costo de envío basado en el departamento
    const subtotal = this.getSubtotal();
    if (subtotal > 200000) {
      this.shippingCost = 0; // Envío gratis para compras mayores a $200,000
    } else {
      this.shippingCost = 15000; // Costo base de envío
    }
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    console.log('Subtotal:', subtotal);
    const total = subtotal + this.shippingCost;
    console.log('Total con envío:', total);
    return total;
  }

  onSubmit() {
    if (this.quickCheckoutForm.invalid) return;

    this.loading = true;
    this.checkoutService.createPreference(this.cartItems, this.quickCheckoutForm.value, false).subscribe(res => {
      console.log('Respuesta de Mercado Pago:', res);
      this.loading = false;
      if(res.status == "success"){
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

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }


  
} 