import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanResponse } from './plans-response';
import { SubscriptionResponse } from './subscriptions-response';

const base = environment.platformProviderApiBaseUrl;

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  constructor(private http: HttpClient) {}

  getPlans(): Observable<PlanResponse[]> {
    return this.http.get<PlanResponse[]>(`${base}${environment.platformProviderPlansEndpointPath}`);
  }

  createSubscription(userId: number, planType: string, period: 'MONTHLY' | 'ANNUALLY', paymentMethodId: string): Observable<SubscriptionResponse> {
    const url = `${base}${environment.platformProviderUserSubscriptionsEndpointPath}`.replace('{userId}', userId.toString());
    return this.http.post<SubscriptionResponse>(url, { planType, period, paymentMethodId });
  }

  getActiveSubscription(userId: number): Observable<SubscriptionResponse> {
    const url = `${base}${environment.platformProviderUserActiveSubscriptionEndpointPath}`.replace('{userId}', userId.toString());
    return this.http.get<SubscriptionResponse>(url);
  }

  getSubscriptions(userId: number): Observable<SubscriptionResponse[]> {
    const url = `${base}${environment.platformProviderUserSubscriptionsEndpointPath}`.replace('{userId}', userId.toString());
    return this.http.get<SubscriptionResponse[]>(url);
  }

  updateSubscription(userId: number, subscriptionId: number, planType: string, period: 'MONTHLY' | 'ANNUALLY'): Observable<SubscriptionResponse> {
    const url = `${base}${environment.platformProviderUserSubscriptionsEndpointPath}/${subscriptionId}`.replace('{userId}', userId.toString());
    return this.http.put<SubscriptionResponse>(url, { planType, period });
  }

  cancelSubscription(userId: number, subscriptionId: number): Observable<void> {
    const url = `${base}${environment.platformProviderSubscriptionCancelEndpointPath}`
      .replace('{userId}', userId.toString())
      .replace('{subscriptionId}', subscriptionId.toString());
    return this.http.post<void>(url, {});
  }

  processPayment(subscriptionId: number, paymentMethodId: string): Observable<PaymentResponse> {
    const url = `${base}${environment.platformProviderSubscriptionPaymentsEndpointPath}`.replace('{subscriptionId}', subscriptionId.toString());
    return this.http.post<PaymentResponse>(url, { subscriptionId, paymentMethodId });
  }

  getPaymentHistory(subscriptionId: number): Observable<PaymentResponse[]> {
    const url = `${base}${environment.platformProviderSubscriptionPaymentsEndpointPath}`.replace('{subscriptionId}', subscriptionId.toString());
    return this.http.get<PaymentResponse[]>(url);
  }
}

export interface PaymentResponse {
  id: number;
  subscriptionId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  receiptUrl: string;
}
