import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private api: ApiService){}

  geBanners(): Observable<
  { status: string; data: any } | { status: string; message: string }
> {
  return this.api.get("banners").pipe(
    map((banners) => {
      console.log("banners",banners);
      return { status: "ok", data: banners };
    }),
    catchError((error) => {
      console.error("Error al obtener banners:", error);
      return of({
        status: "error",
        message: "No se pudo obtener los banners",
      });
    })
  );
}
}
