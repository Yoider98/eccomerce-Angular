import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private api: ApiService) { }

  createPreference(cartItems: any[], email: string) {
    const items = cartItems.map(item => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: 'COP',
    }));

    return this.api.post<any>('checkout', {
      items,
      payerEmail: email,
    });
  }
}
