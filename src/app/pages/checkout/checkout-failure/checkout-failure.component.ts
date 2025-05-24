import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-checkout-failure',
  templateUrl: './checkout-failure.component.html',
  styleUrls: ['./checkout-failure.component.css']
})
export class CheckoutFailureComponent implements OnInit {
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private checkoutService: CheckoutService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || 'Ha ocurrido un error en el pago';
      this.showMessage(this.errorMessage, 'error');
    });
    const cartId = JSON.parse(localStorage.getItem('cartId'));
    await this.checkoutService.deleteCart(cartId).then(response => {
      if (response.status === 'success') {
        this.isLoading = false;
        this.showMessage('Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.', 'info');
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  retryPayment() {
    this.router.navigate(['/checkout']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
} 