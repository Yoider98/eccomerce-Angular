import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login(action.credentials).pipe(
          map(response => {
            console.log('[EFFECT] loginSuccess:', response);
            return AuthActions.loginSuccess({ user: response.user, token: response.token });
          }),
          catchError(error => {
            console.error('[EFFECT] loginFailure:', error);
            return of(AuthActions.loginFailure({ error }));
          })
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('token');
      })
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private authService: AuthService) {}
}
