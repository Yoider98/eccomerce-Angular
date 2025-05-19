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
    const formData = this.quickCheckoutForm.value;

    this.checkoutService.createPreference(this.cartItems, formData.email)
    .subscribe(res => {
      console.log('Respuesta de Mercado Pago:', res);
      this.loading = false;
      if (res.sandboxInitPoint) {
        console.log('Redirigiendo a:', res.sandboxInitPoint);
        window.location.href = res.sandboxInitPoint; // ✅ LLEVA AL USUARIO AL CHECKOUT DE MERCADO PAGO
      } else {
        console.error('No se recibió URL de Mercado Pago');
      }
    }, err => {
      this.loading = false;
      console.error('Error al crear preferencia:', err);
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