import { Component } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
  menuOpen = false;
  isAuthenticated$ = new BehaviorSubject<boolean>(this.authService.isAuthenticated());

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    
    // Suscribirse a los cambios en el token
    this.authService.token$.subscribe(token => {
      this.isAuthenticated$.next(!!token);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
