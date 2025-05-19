import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { selectIsAuthenticated } from "../global/auth.selectors";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map(isAuth => {
        if (!isAuth) {
          // Guarda la URL original como query param
          console.log("state.url", state.url);
          this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
      return false;
    }
        return true;
      })
    );
  }
}
