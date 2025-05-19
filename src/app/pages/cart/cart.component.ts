import { Component, OnInit } from "@angular/core";
import { CartService } from "../../services/cart.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from "sweetalert2";
import { Router } from "@angular/router";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  gender: string;
  type: string;
  subcategory: string;
  sizes: {
    valor: string;
    colors: {
      color: string;
      cant: number;
    }[];
  }[];
  style: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase?: number;
  expiresAt?: Date;
}

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  couponCode: string = '';
  appliedCoupons: Coupon[] = [];

  // Lista de cupones disponibles (en un caso real, esto vendría de una API)
  private availableCoupons: Coupon[] = [
    {
      code: 'DESCUENTO20',
      discount: 20,
      type: 'percentage',
      minPurchase: 100
    },
    {
      code: 'ENVIOGRATIS',
      discount: 15,
      type: 'fixed',
      minPurchase: 50
    },
    {
      code: 'SUPER10',
      discount: 10,
      type: 'percentage'
    }
  ];

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  totalItems() {
    const user = JSON.parse(localStorage.getItem('user'));
    const cartInfo = {
      items: this.cartItems,
      subtotal: this.getsubtotal(),
      total: this.getTotal(),
      coupons: this.appliedCoupons.map(coupon => ({
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type
      })),
      totalDiscount: this.getTotalDiscount(this.getsubtotal())
    };
    localStorage.setItem("cartInfo", JSON.stringify(cartInfo));
    console.log(user);
  
    if (user) {
      /*const cart = {
        userid: user.id,
        subtotal: this.getsubtotal(),
        descuento: this.getTotalDiscount(this.getsubtotal()),
        total: this.getTotal()
      };
  
      const itemcart = this.cartItems.map(item => ({
        productId: item.product.id,
        color: item.color,
        size: item.size,
        price: item.product.price
      }));
  
      console.log("Total de items en el carrito:", itemcart);
      console.log("Total de items en el carrito:", cart);*/
      
      // Redirigir al checkout
      this.router.navigate(['/checkout']);
    } else {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Para continuar con la compra, necesitas iniciar sesión o completar un formulario rápido',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Compra rápida',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUrl = this.router.url;
          this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.router.navigate(['/quick-checkout']);
        }
      });
    }
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  increaseQuantity(productId: number, size: string, color: string): void {
    const item = this.cartItems.find(
      (cartItem) => 
        cartItem.product.id === productId && 
        cartItem.size === size && 
        cartItem.color === color
    );
    if (item) {
      this.cartService.updateQuantity(productId, size, color, item.quantity + 1);
    }
  }

  deincreaseQuantity(productId: number, size: string, color: string): void {
    const item = this.cartItems.find(
      (cartItem) => 
        cartItem.product.id === productId && 
        cartItem.size === size && 
        cartItem.color === color
    );
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, size, color, item.quantity - 1);
    }
  }

  removeItem(productId: number, size: string, color: string): void {
    this.cartService.removeFromCart(productId, size, color);
  }

  getsubtotal(): number {
    const subtotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    return subtotal;
  }

  getTotal(): number {
    const subtotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const totalDiscount = this.getTotalDiscount(subtotal);
    return Number((subtotal - totalDiscount).toFixed(2));
  }

  getTotalDiscount(subtotal: number): number {
    let totalDiscount = 0;
    for (const coupon of this.appliedCoupons) {
      if (coupon.type === 'percentage') {
        totalDiscount += (subtotal * coupon.discount) / 100;
      } else {
        totalDiscount += coupon.discount;
      }
    }
    return totalDiscount;
  }

  applyCoupon() {
    if (!this.couponCode) {
      this.showMessage('Por favor ingresa un código de cupón', 'error');
      return;
    }

    const code = this.couponCode.toUpperCase();
    if (this.appliedCoupons.some(c => c.code === code)) {
      this.showMessage('Este cupón ya está aplicado', 'error');
      return;
    }

    const coupon = this.availableCoupons.find(c => c.code === code);
    if (!coupon) {
      this.showMessage('Cupón no válido', 'error');
      return;
    }

    const subtotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      this.showMessage(`El cupón requiere una compra mínima de $${coupon.minPurchase}`, 'error');
      return;
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      this.showMessage('Este cupón ha expirado', 'error');
      return;
    }

    this.appliedCoupons.push(coupon);
    this.couponCode = '';
    this.showMessage('¡Cupón aplicado con éxito!', 'success');
  }

  removeCoupon(code: string) {
    this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== code);
    this.showMessage('Cupón removido', 'info');
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
