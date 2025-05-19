import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout-pending',
  templateUrl: './checkout-pending.component.html',
  styleUrls: ['./checkout-pending.component.css']
})
export class CheckoutPendingComponent implements OnInit {
  paymentId: string = '';
  status: string = '';
  merchantOrderId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || '';
      this.status = params['status'] || '';
      this.merchantOrderId = params['merchant_order_id'] || '';

      this.showMessage('Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.', 'info');
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

  goToHome() {
    this.router.navigate(['/']);
  }
} 