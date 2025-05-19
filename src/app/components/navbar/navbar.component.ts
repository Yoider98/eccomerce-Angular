import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../global/auth.selectors';
import { logout } from '../../global/auth.actions';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  menuOpen = false;

  constructor( private router: Router, private store: Store) {}



  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.store.dispatch(logout());
    this.router.navigate(["/"]);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
