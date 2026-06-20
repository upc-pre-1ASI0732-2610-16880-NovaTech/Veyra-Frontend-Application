export interface SubscriptionResponse {
  id: number;
  userId: number;
  planType: string;
  period: 'MONTHLY' | 'ANNUALLY';
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}
