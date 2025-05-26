import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CheckoutService } from "src/app/services/checkout.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-checkout-failure",
  templateUrl: "./checkout-failure.component.html",
  styleUrls: ["./checkout-failure.component.css"],
})
export class CheckoutFailureComponent implements OnInit {
  errorMessage: string = "";
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private checkoutService: CheckoutService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.route.queryParams.subscribe((params) => {
      this.errorMessage = params["error"] || "Ha ocurrido un error en el pago";
      this.showMessage(this.errorMessage, "error");
    });
    const cartId = JSON.parse(localStorage.getItem("cartId"));
    await this.checkoutService.deleteCart(cartId).then((response) => {
      if (response.status === "success") {
        this.showMessage(
          "Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.",
          "info"
        );
      }
    });
    this.isLoading = false;
  }

  private showMessage(message: string, type: "success" | "error" | "info") {
    Swal.fire({
      title:
        type === "success"
          ? "¡Éxito!"
          : type === "error"
          ? "¡Error!"
          : "Información",
      text: message,
      icon: type,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#3085d6",
    });
  }

  retryPayment() {
    this.router.navigate(["/checkout"]);
  }

  goToHome() {
    this.router.navigate(["/"]);
  }
}
