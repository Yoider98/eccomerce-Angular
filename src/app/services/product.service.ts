import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  constructor(private api: ApiService) {}

  // Retornamos un Observable
  getProducts(): Observable<
    { status: string; data: any } | { status: string; message: string }
  > {
    return this.api.get("products").pipe(
      map((product) => {
        return { status: "ok", data: product };
      }),
      catchError((error) => {
        console.error("Error al obtener productos:", error);
        return of({
          status: "error",
          message: "No se pudo obtener los productos",
        });
      })
    );
  }
}
