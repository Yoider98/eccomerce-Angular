// src/app/services/cart.service.ts

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ApiService } from "./api.service";

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

@Injectable({
  providedIn: "root",
})
export class CartService {
  private api: ApiService;
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private discountCode: string | null = null;
  private discountPercentage: number = 0;

  cart$ = this.cartSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  private updateCart() {
    localStorage.setItem("cart", JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  addToCart(product: Product, quantity: number, size: string, color: string) {
    const item = this.cartItems.find(
      (i) => i.product.id === product.id && i.size === size && i.color === color
    );

    if (item) {
      item.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity, size, color });
    }

    this.updateCart();
  }

  removeFromCart(productId: number, size: string, color: string) {
    this.cartItems = this.cartItems.filter(
      (i) => i.product.id !== productId || i.size !== size || i.color !== color
    );
    this.updateCart();
  }
  
  updateQuantity(productId: number, size: string, color: string, quantity: number) {
    const item = this.cartItems.find(
      (i) => i.product.id === productId && i.size === size && i.color === color
    );
    if (item) {
      item.quantity = quantity;
      this.cartSubject.next([...this.cartItems]);
    }
  }
  clearCart() {
    this.cartItems = [];
    this.updateCart();
  }

  getCartItems() {
    return this.cartItems;
  }

  getCartTotal() {
    return this.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }

  totalItems() {
    console.log("Total de items en el carrito:", this.cartItems);
  }

  processOrder(cart: any[]): Observable<any> {
    return this.api.post('orders', { items: cart });
  }

  applyDiscount(code: string): boolean {
    if (code === 'DESCUENTO20') {
      this.discountCode = code;
      this.discountPercentage = 20;
      return true;
    }
    return false;
  }

  getDiscount(): number {
    if (!this.discountCode) return 0;
    
    const subtotal = this.getSubtotal();
    return (subtotal * this.discountPercentage) / 100;
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount();
  }
}
