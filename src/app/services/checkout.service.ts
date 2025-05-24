import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private api: ApiService) { }

  createPreference(cartItems: any[], user: any, userRegister: boolean) {
    let card = {};
    console.log("user", user);
    if(userRegister) {
       card = {
        "userId": user.id,

       }
    }else{
      card = {
        "guestName": user.nombre + " " + user.apellido,
        "guestEmail": user.email,
        "guestAddress": user.departamento + " " + user.ciudad + " " + user.direccion,
        "guestPhone": user.telefono,
      }
    }

       const items = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.product.price
    }));

    console.log("items", items);
    console.log("card", card);

    return this.api.post<any>('createCart', {
      items,
      card
    });
  }


  async getPaymentStatus(paymentId: string, cartId: string, userId:string): Promise<any> {  
      return this.api.get<any>(`payment/status${paymentId}?cartId=${cartId}&userId=${userId}`);
  }
}
