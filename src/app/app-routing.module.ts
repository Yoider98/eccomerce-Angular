import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AuthGuard } from "./guards/auth.guard";
import { CartComponent } from "./pages/cart/cart.component";
import { LoginComponent } from "./pages/login/login.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { ShopComponent } from "./pages/shop/shop.component";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { QuickCheckoutComponent } from "./pages/checkout/quick-checkout.component";
import { DetailProductComponent } from './pages/shop/detail-product/detail-product.component';
import { CheckoutSuccessComponent } from './pages/checkout/checkout-success/checkout-success.component';
import { CheckoutFailureComponent } from './pages/checkout/checkout-failure/checkout-failure.component';
import { CheckoutPendingComponent } from './pages/checkout/checkout-pending/checkout-pending.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "shop", component: ShopComponent },
  { path: "shop/:id", component: DetailProductComponent },
  { path: "cart", component: CartComponent },
  { path: "checkout", component: CheckoutComponent },
  { path: "quick-checkout", component: QuickCheckoutComponent },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
  { path: "checkout/success", component: CheckoutSuccessComponent },
  { path: "checkout/failure", component: CheckoutFailureComponent },
  { path: "checkout/pending", component: CheckoutPendingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
