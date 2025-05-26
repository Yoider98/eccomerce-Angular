import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { tap, catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiUrl;

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private api: ApiService,
    private router: Router,
    private http: HttpClient
  ) {
    // Intentar recuperar el estado de autenticación del localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.api.post<LoginResponse>("login", credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          this.saveInfoSession(response.token, response.user);
        }
      }),
      catchError(error => {
        //console.error('Error en auth service:', error);
        return throwError(error);
      })
    );
  }

  saveInfoSession(token: string, user: any): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  register(data: any): Observable<any> {
    return this.api.post("signup", data);
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  resetPassword(email: string): Observable<any> {
    return this.api.post("reset-password", { email });
  }
}
