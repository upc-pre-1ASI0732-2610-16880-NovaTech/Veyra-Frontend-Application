import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
      error: (e: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(e);
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

  updateSubscription(planType: string, period: 'MONTHLY' | 'ANNUALLY', onSuccess?: () => void, onError?: (msg: string) => void): void {
    const userId = Number(localStorage.getItem('userId'));
    const sub = this._subscriptionSignal();
    if (!userId || !sub) return;
    this._loadingSignal.set(true);
    this._errorSignal.set(null);
    this.api.updateSubscription(userId, sub.id, planType, period).subscribe({
      next: (res) => {
        this._subscriptionSignal.set(Subscription.fromResponse(res));
        this._loadingSignal.set(false);
        onSuccess?.();
      },
      error: (e: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(e);
        this._errorSignal.set(msg);
        this._loadingSignal.set(false);
        onError?.(msg);
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
      error: (e: HttpErrorResponse) => {
        this._errorSignal.set(this.extractErrorMessage(e));
        this._loadingSignal.set(false);
      }
    });
  }

  private extractErrorMessage(e: HttpErrorResponse): string {
    if (e.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    if (typeof e.error === 'string' && e.error.length) return e.error;
    if (e.error?.message) return e.error.message;
    if (e.error?.detail) return e.error.detail;
    if (e.status === 400) return 'Solicitud inválida. Verifica los datos ingresados.';
    if (e.status === 402) return 'Pago requerido. Verifica los datos de tu tarjeta.';
    if (e.status === 409) return 'Ya tienes una suscripción activa.';
    if (e.status >= 500) return 'Error del servidor. Intenta nuevamente en unos minutos.';
    return e.message ?? 'Ocurrió un error inesperado.';
  }
}
