import { Injectable, signal } from '@angular/core';
import { PaymentsApi } from '../infrastructure/payments-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly _plansSignal = signal<Plan[]>([]);
  private readonly _selectedPlanSignal = signal<Plan | null>(null);
  private readonly _billingCycleSignal = signal<'MONTHLY' | 'ANNUALLY'>('MONTHLY');
  private readonly _subscriptionSignal = signal<Subscription | null>(null);
  private readonly _loadingSignal = signal<boolean>(false);
  private readonly _errorSignal = signal<string | null>(null);

  readonly plans = this._plansSignal.asReadonly();
  readonly selectedPlan = this._selectedPlanSignal.asReadonly();
  readonly billingCycle = this._billingCycleSignal.asReadonly();
  readonly subscription = this._subscriptionSignal.asReadonly();
  readonly loading = this._loadingSignal.asReadonly();
  readonly error = this._errorSignal.asReadonly();

  constructor(private api: PaymentsApi) {}

  loadPlans(): void {
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.getPlans().subscribe({
      next: (data) => {
        this._plansSignal.set(data.map(p => Plan.fromResponse(p)));
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to load plans.');
        this._loadingSignal.set(false);
      }
    });
  }

  selectPlan(plan: Plan): void {
    this._selectedPlanSignal.set(plan);
  }

  setBillingCycle(cycle: 'MONTHLY' | 'ANNUALLY'): void {
    this._billingCycleSignal.set(cycle);
  }

  createSubscription(
    paymentMethodId: string,
    planType?: string,
    period?: 'MONTHLY' | 'ANNUALLY',
    onSuccess?: () => void,
    onError?: (msg: string) => void
  ): void {
    const userId = Number(localStorage.getItem('userId'));
    const resolvedPlanType = planType ?? this._selectedPlanSignal()?.id;
    const resolvedPeriod = period ?? this._billingCycleSignal();

    if (!resolvedPlanType || !userId) {
      onError?.('No se pudo determinar el plan o el usuario.');
      return;
    }

    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.createSubscription(userId, resolvedPlanType, resolvedPeriod, paymentMethodId).subscribe({
      next: (res) => {
        this._subscriptionSignal.set(Subscription.fromResponse(res));
        this._loadingSignal.set(false);
        onSuccess?.();
      },
      error: (e) => {
        const msg = e.message ?? 'Failed to create subscription.';
        this._errorSignal.set(msg);
        this._loadingSignal.set(false);
        onError?.(msg);
      }
    });
  }

  loadActiveSubscription(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) return;
    this._loadingSignal.set(true);
    this.api.getActiveSubscription(userId).subscribe({
      next: (res) => {
        this._subscriptionSignal.set(Subscription.fromResponse(res));
        this._loadingSignal.set(false);
      },
      error: () => {
        this._subscriptionSignal.set(null);
        this._loadingSignal.set(false);
      }
    });
  }

  cancelSubscription(onSuccess?: () => void): void {
    const userId = Number(localStorage.getItem('userId'));
    const sub = this._subscriptionSignal();
    if (!userId || !sub) return;
    this._loadingSignal.set(true);
    this.api.cancelSubscription(userId, sub.id).subscribe({
      next: () => {
        this._subscriptionSignal.update(s =>
          s ? Subscription.fromResponse({ ...s, status: 'CANCELED' } as any) : null
        );
        this._loadingSignal.set(false);
        onSuccess?.();
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to cancel subscription.');
        this._loadingSignal.set(false);
      }
    });
  }
}
