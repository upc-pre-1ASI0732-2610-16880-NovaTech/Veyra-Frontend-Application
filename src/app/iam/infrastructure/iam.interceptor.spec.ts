import { TestBed } from '@angular/core/testing';
import {
  HttpClient, HttpErrorResponse,
  provideHttpClient, withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController, provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authenticationInterceptor } from './iam.interceptor';
import { IamStore } from '../application/iam.store';

describe('authenticationInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let router: Router;

  const setup = (token: string | null) => {
    localStorage.clear();
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', '1');
    }

    TestBed.configureTestingModule({
      providers: [
        IamStore,
        provideRouter([]),
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  };

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  // ─── Authorization header ────────────────────────────────────────────────────
  it('adds Authorization header when token is present', () => {
    setup('my-test-token');

    http.get('/api/test').subscribe();

    const req = controller.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-test-token');
    req.flush({});
  });

  it('does not add Authorization header when no token', () => {
    setup(null);

    http.get('/api/test').subscribe();

    const req = controller.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('forwards the request unchanged (same URL, same method)', () => {
    setup('tk');

    http.post('/api/resource', { x: 1 }).subscribe();

    const req = controller.expectOne('/api/resource');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  // ─── 401 handling ───────────────────────────────────────────────────────────
  it('clears token from localStorage on 401 response', () => {
    setup('valid-token');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('nursingHomeId', '5');

    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    http.get('/api/protected').subscribe({ error: () => {} });

    const req = controller.expectOne('/api/protected');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('nursingHomeId')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/iam/sign-in']);
  });

  it('navigates to /iam/sign-in on 401', () => {
    setup('some-token');
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    http.get('/api/me').subscribe({ error: () => {} });

    controller.expectOne('/api/me').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith(['/iam/sign-in']);
  });

  it('re-throws the error so downstream subscribers receive it', () => {
    setup('some-token');
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    let caught: HttpErrorResponse | undefined;

    http.get('/api/me').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/me').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(caught).toBeInstanceOf(HttpErrorResponse);
    expect(caught!.status).toBe(401);
  });

  // ─── Non-401 errors propagate without logout ─────────────────────────────────
  it('does not clear localStorage on 403 response', () => {
    setup('admin-token');
    spyOn(router, 'navigate');

    http.get('/api/forbidden').subscribe({ error: () => {} });

    controller.expectOne('/api/forbidden').flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('token')).toBe('admin-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not navigate on 500 response', () => {
    setup('tk');
    const navigateSpy = spyOn(router, 'navigate');

    http.get('/api/crash').subscribe({ error: () => {} });

    controller.expectOne('/api/crash').flush('Error', { status: 500, statusText: 'Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('still re-throws error for non-401 errors', () => {
    setup(null);
    let caught: HttpErrorResponse | undefined;

    http.get('/api/crash').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/crash').flush('Error', { status: 500, statusText: 'Server Error' });

    expect(caught).toBeInstanceOf(HttpErrorResponse);
    expect(caught!.status).toBe(500);
  });
});
