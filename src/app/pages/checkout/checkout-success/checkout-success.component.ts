import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.css']
})
export class CheckoutSuccessComponent implements OnInit {
  paymentId: string = '';
  status: string = '';
  merchantOrderId: string = '';
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private checkoutService: CheckoutService
  ) {}

  async ngOnInit() {

    this.route.queryParams.subscribe(async params => {
      this.paymentId = params['payment_id'] || '';
      this.status = params['status'] || '';
      this.merchantOrderId = params['merchant_order_id'] || '';

      try {
        const cartId = JSON.parse(localStorage.getItem('cartId'));
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await this.checkoutService.getPaymentStatus(this.paymentId, cartId, user.id);
        if (response.status === 'success') {
          this.showMessage('¡Pago exitoso! Gracias por tu compra.', 'success');
        } else {
          this.showMessage('El estado del pago no es exitoso.', 'info');
        }
      } catch (error) {
        this.showMessage('Error al procesar el pago.', 'error');
        console.error('Error fetching payment status:', error);
      }
    });
    this.isLoading = false;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
} 