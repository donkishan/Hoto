import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('accessToken');

  if (!isLoggedIn) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
