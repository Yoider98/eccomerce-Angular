import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { Store } from '@ngrx/store';
import { hydrateAuth } from './global/auth.actions';
import { ApiService } from "./services/api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "ecommerce-app";
  currentUrl: string = '';

  constructor(public router: Router, private store: Store, private api: ApiService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    let location = this.api.get("location");

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token) {
      console.log('[APP] Hidratando store con token y user:', token, user);
      this.store.dispatch(hydrateAuth({ user: user ? JSON.parse(user) : null, token }));
    }
  }
}
