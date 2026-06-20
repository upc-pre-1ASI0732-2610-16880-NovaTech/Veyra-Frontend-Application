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

  createSubscription(paymentMethodId: string): void {
    const userId = Number(localStorage.getItem('userId'));
    const plan = this._selectedPlanSignal();
    if (!plan || !userId) {
      this._errorSignal.set('No plan or user selected.');
      return;
    }
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.createSubscription(userId, plan.id, this._billingCycleSignal(), paymentMethodId).subscribe({
      next: (res) => {
        this._subscriptionSignal.set(Subscription.fromResponse(res));
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to create subscription.');
        this._loadingSignal.set(false);
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
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to load subscription.');
        this._loadingSignal.set(false);
      }
    });
  }

  cancelSubscription(): void {
    const userId = Number(localStorage.getItem('userId'));
    const sub = this._subscriptionSignal();
    if (!userId || !sub) return;
    this._loadingSignal.set(true);
    this.api.cancelSubscription(userId, sub.id).subscribe({
      next: () => {
        this._subscriptionSignal.update(s => s ? { ...s, status: 'CANCELLED' } as unknown as Subscription : null);
        this._loadingSignal.set(false);
      },
      error: (e) => {
        this._errorSignal.set(e.message ?? 'Failed to cancel subscription.');
        this._loadingSignal.set(false);
      }
    });
  }
}
