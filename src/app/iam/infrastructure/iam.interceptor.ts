import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { IamStore } from '../application/iam.store';
import { catchError, throwError } from 'rxjs';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const iamStore = inject(IamStore);
  const router = inject(Router);

  const token = iamStore.currentToken();

  const outgoing = token && token.length > 0
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('nursingHomeId');
        router.navigate(['/iam/sign-in']).then();
      }
      return throwError(() => err);
    })
  );
};
