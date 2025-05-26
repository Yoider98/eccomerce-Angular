import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { ApiService } from "./services/api.service";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "ecommerce-app";
  currentUrl: string = '';

  constructor(
    public router: Router,
    private api: ApiService,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    let location = this.api.get("location");

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token) {
      this.authService.saveInfoSession(token, user ? JSON.parse(user) : null);
    }
  }
}
