import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HomeComponent } from "./pages/home/home.component";
import { ShopComponent } from "./pages/shop/shop.component";
import { LoginComponent } from "./pages/login/login.component";
import { CartComponent } from "./pages/cart/cart.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { HttpClientModule } from "@angular/common/http";

import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { DetailProductComponent } from "./pages/shop/detail-product/detail-product.component";
import { MatDialogModule } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatExpansionModule } from "@angular/material/expansion";
import { SwiperModule } from "swiper/angular";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ReactiveFormsModule } from "@angular/forms";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { QuickCheckoutComponent } from "./pages/checkout/quick-checkout.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CheckoutSuccessComponent } from "./pages/checkout/checkout-success/checkout-success.component";
import { CheckoutFailureComponent } from "./pages/checkout/checkout-failure/checkout-failure.component";
import { CheckoutPendingComponent } from "./pages/checkout/checkout-pending/checkout-pending.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ShopComponent,
    LoginComponent,
    CartComponent,
    ProfileComponent,
    DetailProductComponent,
    CheckoutComponent,
    QuickCheckoutComponent,
    CheckoutSuccessComponent,
    CheckoutFailureComponent,
    CheckoutPendingComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    HttpClientModule,
    MatExpansionModule,
    SwiperModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
