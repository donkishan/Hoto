import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Attach token to the request
  const clonedRequest = req.clone({
    headers: new HttpHeaders({
      Authorization: `${accessToken}`
    })
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        // Token might be expired, attempt to refresh
        return from(authService.refreshAccessToken()).pipe(
          switchMap((newToken: string) => {
            // Retry the original request with new token
            const retriedReq = req.clone({
              headers: new HttpHeaders({
                Authorization: `Bearer ${newToken}`
              })
            });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, log user out or redirect
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
