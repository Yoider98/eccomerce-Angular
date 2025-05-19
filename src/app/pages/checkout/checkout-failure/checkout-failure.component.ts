import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout-failure',
  templateUrl: './checkout-failure.component.html',
  styleUrls: ['./checkout-failure.component.css']
})
export class CheckoutFailureComponent implements OnInit {
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || 'Ha ocurrido un error en el pago';
      this.showMessage(this.errorMessage, 'error');
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