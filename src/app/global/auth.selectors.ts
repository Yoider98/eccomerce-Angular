import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  state => state ? state.user : null
);

export const selectToken = createSelector(
  selectAuthState,
  state => state && state.token ? state.token : null
);

export const selectIsAuthenticated = createSelector(
  selectToken,
  token => !!token
);
