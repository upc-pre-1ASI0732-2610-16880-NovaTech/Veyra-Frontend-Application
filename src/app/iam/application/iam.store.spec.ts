import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IamStore } from './iam.store';
import { IamApi } from '../infrastructure/iam-api';
import { PaymentsApi } from '../../payments/infrastructure/payments-api';
import { SubscriptionResponse } from '../../payments/infrastructure/subscriptions-response';
import { SignInCommand } from '../domain/model/sign-in.command';

const cmd = (username = 'admin', password = 'pass') => new SignInCommand({ username, password });

const makeSignInRes = (overrides: object = {}) => ({
  id: 1, username: 'admin', roles: ['ROLE_ADMIN'], token: 'tk', mfaRequired: false,
  ...overrides
});

const activeSub: SubscriptionResponse = {
  id: 10, userId: 1, stripeSubscriptionId: 'sub_x', planType: 'NURSING_HOME',
  period: 'MONTHLY', amount: 300, currency: 'USD', status: 'ACTIVE',
  currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01', createdAt: '2026-01-01'
};

describe('IamStore', () => {
  let store: IamStore;
  let iamApi: jasmine.SpyObj<IamApi>;
  let paymentsApi: jasmine.SpyObj<PaymentsApi>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();

    iamApi = jasmine.createSpyObj('IamApi', [
      'signIn', 'signUp', 'createAdministrator', 'mfaSetup', 'mfaEnable', 'mfaDisable', 'mfaVerify'
    ]);
    paymentsApi = jasmine.createSpyObj('PaymentsApi', [
      'getPlans', 'createSubscription', 'getActiveSubscription',
      'getSubscriptions', 'updateSubscription', 'cancelSubscription',
      'processPayment', 'getPaymentHistory'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        IamStore,
        { provide: IamApi, useValue: iamApi },
        { provide: PaymentsApi, useValue: paymentsApi },
        { provide: Router, useValue: router }
      ]
    });

    store = TestBed.inject(IamStore);
  });

  afterEach(() => localStorage.clear());

  // ─── Initial state ───────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('restores session when token + userId exist in localStorage', () => {
      localStorage.setItem('token', 'saved-tk');
      localStorage.setItem('userId', '7');
      localStorage.setItem('username', 'juan');
      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        providers: [
          IamStore,
          { provide: IamApi, useValue: iamApi },
          { provide: PaymentsApi, useValue: paymentsApi },
          { provide: Router, useValue: router }
        ]
      });

      const s = TestBed.inject(IamStore);
      expect(s.isSignedIn()).toBeTrue();
      expect(s.currentUserId()).toBe(7);
    });

    it('starts as signed-out when localStorage is empty', () => {
      expect(store.isSignedIn()).toBeFalse();
      expect(store.currentToken()).toBeNull();
    });
  });

  // ─── signIn ──────────────────────────────────────────────────────────────────
  describe('signIn()', () => {
    it('navigates to /nursing/nursing-homes/new when ROLE_ADMIN has active subscription', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes()));
      paymentsApi.getActiveSubscription.and.returnValue(of(activeSub));

      store.signIn(cmd(), router);

      expect(router.navigate).toHaveBeenCalledWith(['/nursing/nursing-homes/new']);
    });

    it('navigates to /payments/choose when ROLE_ADMIN has no subscription', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes()));
      paymentsApi.getActiveSubscription.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );

      store.signIn(cmd(), router);

      expect(router.navigate).toHaveBeenCalledWith(['/payments/choose']);
    });

    it('stores token and userId on successful sign-in', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes({ roles: ['ROLE_USER'] })));

      store.signIn(cmd(), router);

      expect(localStorage.getItem('token')).toBe('tk');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('username')).toBe('admin');
    });

    it('sets isSignedIn to true after successful sign-in', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes({ roles: ['ROLE_USER'] })));

      store.signIn(cmd(), router);

      expect(store.isSignedIn()).toBeTrue();
    });

    it('navigates to /analytics/dashboard for non-admin roles', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes({ roles: ['ROLE_USER'] })));

      store.signIn(cmd('staff'), router);

      expect(router.navigate).toHaveBeenCalledWith(['/analytics/dashboard']);
    });

    it('stores mfa_pending_user_id and redirects to /iam/mfa-verify when MFA required', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes({ id: 42, mfaRequired: true, token: '' })));

      store.signIn(cmd(), router);

      expect(localStorage.getItem('mfa_pending_user_id')).toBe('42');
      expect(router.navigate).toHaveBeenCalledWith(['/iam/mfa-verify']);
    });

    it('does not store token when MFA is required', () => {
      iamApi.signIn.and.returnValue(of(makeSignInRes({ mfaRequired: true, token: '' })));

      store.signIn(cmd(), router);

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('navigates to /iam/sign-in on API error', () => {
      iamApi.signIn.and.returnValue(throwError(() => new Error('Network error')));

      store.signIn(cmd('x', 'y'), router);

      expect(router.navigate).toHaveBeenCalledWith(['/iam/sign-in']);
    });

    it('sets isSignedIn to false on API error', () => {
      iamApi.signIn.and.returnValue(throwError(() => new Error('fail')));

      store.signIn(cmd('x', 'y'), router);

      expect(store.isSignedIn()).toBeFalse();
    });
  });

  // ─── signOut ─────────────────────────────────────────────────────────────────
  describe('signOut()', () => {
    it('clears all auth keys from localStorage', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('userId', '1');
      localStorage.setItem('username', 'admin');
      localStorage.setItem('nursingHomeId', '5');

      store.signOut(router);

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('nursingHomeId')).toBeNull();
    });

    it('navigates to /home after sign-out', () => {
      store.signOut(router);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('sets isSignedIn to false', () => {
      store.signOut(router);
      expect(store.isSignedIn()).toBeFalse();
    });
  });

  // ─── verifyMfa ───────────────────────────────────────────────────────────────
  describe('verifyMfa()', () => {
    it('stores token and navigates to /analytics/dashboard on success', () => {
      localStorage.setItem('mfa_pending_user_id', '99');
      iamApi.mfaVerify.and.returnValue(of({ token: 'mfa-token' }));

      store.verifyMfa('123456', router);

      expect(localStorage.getItem('token')).toBe('mfa-token');
      expect(localStorage.getItem('mfa_pending_user_id')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/analytics/dashboard']);
    });

    it('sets error signal on invalid TOTP code', () => {
      localStorage.setItem('mfa_pending_user_id', '99');
      iamApi.mfaVerify.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

      store.verifyMfa('000000', router);

      expect(store.error()).toContain('Invalid');
    });

    it('redirects to sign-in immediately when no pending user id', () => {
      store.verifyMfa('123456', router);
      expect(router.navigate).toHaveBeenCalledWith(['/iam/sign-in']);
    });
  });
});
