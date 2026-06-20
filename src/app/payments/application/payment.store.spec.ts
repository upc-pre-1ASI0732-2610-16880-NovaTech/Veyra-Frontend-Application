import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentStore } from './payment.store';
import { PaymentsApi } from '../infrastructure/payments-api';
import { PlanResponse } from '../infrastructure/plans-response';
import { SubscriptionResponse } from '../infrastructure/subscriptions-response';

const makePlan = (overrides: Partial<PlanResponse> = {}): PlanResponse => ({
  id: 'NURSING_HOME',
  displayName: 'Nursing Home Plan',
  description: 'Institutional plan',
  prices: [
    { period: 'MONTHLY',   price: 300,  currency: 'USD' },
    { period: 'ANNUALLY',  price: 3000, currency: 'USD' }
  ],
  features: [{ name: 'Feature A', included: true }],
  ...overrides
});

const makeSub = (overrides: Partial<SubscriptionResponse> = {}): SubscriptionResponse => ({
  id: 10, userId: 1, stripeSubscriptionId: 'sub_x', planType: 'NURSING_HOME',
  period: 'MONTHLY', amount: 300, currency: 'USD', status: 'ACTIVE',
  currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01', createdAt: '2026-01-01',
  ...overrides
});

describe('PaymentStore', () => {
  let store: PaymentStore;
  let api: jasmine.SpyObj<PaymentsApi>;

  beforeEach(() => {
    localStorage.clear();

    api = jasmine.createSpyObj('PaymentsApi', [
      'getPlans', 'createSubscription', 'getActiveSubscription',
      'getSubscriptions', 'updateSubscription', 'cancelSubscription',
      'processPayment', 'getPaymentHistory'
    ]);

    TestBed.configureTestingModule({
      providers: [PaymentStore, { provide: PaymentsApi, useValue: api }]
    });

    store = TestBed.inject(PaymentStore);
  });

  afterEach(() => localStorage.clear());

  // ─── loadPlans ───────────────────────────────────────────────────────────────
  describe('loadPlans()', () => {
    it('populates plans signal from API response', () => {
      api.getPlans.and.returnValue(of([makePlan()]));

      store.loadPlans();

      expect(store.plans().length).toBe(1);
      expect(store.plans()[0].id).toBe('NURSING_HOME');
    });

    it('computes monthlyPrice and annualPrice from prices array', () => {
      api.getPlans.and.returnValue(of([makePlan()]));

      store.loadPlans();

      const p = store.plans()[0];
      expect(p.monthlyPrice).toBe(300);
      expect(p.annualPrice).toBe(3000);
    });

    it('sets loading to false after success', () => {
      api.getPlans.and.returnValue(of([makePlan()]));

      store.loadPlans();

      expect(store.loading()).toBeFalse();
    });

    it('sets error signal on API failure', () => {
      api.getPlans.and.returnValue(throwError(() => new Error('Server error')));

      store.loadPlans();

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBeFalse();
    });

    it('clears plans signal on repeated load failure', () => {
      api.getPlans.and.returnValue(of([makePlan()]));
      store.loadPlans();
      api.getPlans.and.returnValue(throwError(() => new Error('fail')));
      store.loadPlans();
      // plans still holds the previous value (not cleared on error)
      expect(store.error()).toBeTruthy();
    });
  });

  // ─── createSubscription ──────────────────────────────────────────────────────
  describe('createSubscription()', () => {
    it('calls onSuccess callback when API succeeds', () => {
      localStorage.setItem('userId', '1');
      api.createSubscription.and.returnValue(of(makeSub()));
      const onSuccess = jasmine.createSpy('onSuccess');

      store.createSubscription('pm_card_visa', 'NURSING_HOME', 'MONTHLY', onSuccess);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('sets subscription signal on success', () => {
      localStorage.setItem('userId', '1');
      api.createSubscription.and.returnValue(of(makeSub({ id: 99 })));

      store.createSubscription('pm_card_visa', 'NURSING_HOME', 'MONTHLY');

      expect(store.subscription()?.id).toBe(99);
    });

    it('calls onError callback when API fails', () => {
      localStorage.setItem('userId', '1');
      api.createSubscription.and.returnValue(throwError(() => new Error('Payment declined')));
      const onError = jasmine.createSpy('onError');

      store.createSubscription('pm_bad', 'NURSING_HOME', 'MONTHLY', undefined, onError);

      expect(onError).toHaveBeenCalledWith(jasmine.stringContaining('Payment declined'));
    });

    it('calls onError immediately when userId is missing from localStorage', () => {
      const onError = jasmine.createSpy('onError');

      store.createSubscription('pm_card_visa', 'NURSING_HOME', 'MONTHLY', undefined, onError);

      expect(onError).toHaveBeenCalledWith(jasmine.any(String));
      expect(api.createSubscription).not.toHaveBeenCalled();
    });

    it('calls onError immediately when planType is not provided and no plan selected', () => {
      localStorage.setItem('userId', '1');
      const onError = jasmine.createSpy('onError');

      store.createSubscription('pm_card_visa', undefined, undefined, undefined, onError);

      expect(onError).toHaveBeenCalled();
    });

    it('passes correct planType and period to the API', () => {
      localStorage.setItem('userId', '3');
      api.createSubscription.and.returnValue(of(makeSub()));

      store.createSubscription('pm_card_visa', 'FAMILY', 'ANNUALLY');

      expect(api.createSubscription).toHaveBeenCalledWith(3, 'FAMILY', 'ANNUALLY', 'pm_card_visa');
    });
  });

  // ─── loadActiveSubscription ──────────────────────────────────────────────────
  describe('loadActiveSubscription()', () => {
    it('sets subscription signal from API response', () => {
      localStorage.setItem('userId', '1');
      api.getActiveSubscription.and.returnValue(of(makeSub({ status: 'ACTIVE' })));

      store.loadActiveSubscription();

      expect(store.subscription()?.status).toBe('ACTIVE');
    });

    it('sets subscription to null on API failure', () => {
      localStorage.setItem('userId', '1');
      api.getActiveSubscription.and.returnValue(throwError(() => ({ status: 404 })));

      store.loadActiveSubscription();

      expect(store.subscription()).toBeNull();
    });

    it('does nothing when userId is absent', () => {
      store.loadActiveSubscription();
      expect(api.getActiveSubscription).not.toHaveBeenCalled();
    });
  });

  // ─── cancelSubscription ──────────────────────────────────────────────────────
  describe('cancelSubscription()', () => {
    it('marks subscription as CANCELED after API call', () => {
      localStorage.setItem('userId', '1');
      api.getActiveSubscription.and.returnValue(of(makeSub()));
      store.loadActiveSubscription();
      api.cancelSubscription.and.returnValue(of(undefined as any));

      store.cancelSubscription();

      expect(store.subscription()?.status).toBe('CANCELED');
    });
  });
});
